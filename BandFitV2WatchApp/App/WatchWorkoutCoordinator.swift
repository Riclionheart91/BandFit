import Foundation
import Combine
import WatchKit
import BandFitKit

@MainActor
public final class WatchWorkoutCoordinator: ObservableObject {
    public let engine = WorkoutEngine()
    public let health = WatchHealthManager()
    public let motion = MotionRepManager()
    public let connectivity = WatchConnectivityManager.shared

    private var cancellables = Set<AnyCancellable>()
    private var metricsSyncTimer: AnyCancellable?

    public init() {
        // Same fix as on iPhone: forward child ObservableObjects' publishes so SwiftUI
        // actually re-renders (engine.plan, engine.snapshot, health.liveMetrics all
        // live on separate objects and won't trigger updates on their own).
        engine.objectWillChange
            .sink { [weak self] _ in self?.objectWillChange.send() }
            .store(in: &cancellables)
        health.objectWillChange
            .sink { [weak self] _ in self?.objectWillChange.send() }
            .store(in: &cancellables)
        connectivity.objectWillChange
            .sink { [weak self] _ in self?.objectWillChange.send() }
            .store(in: &cancellables)

        connectivity.onStartWorkout = { [weak self] plan in
            self?.start(plan: plan)
        }
        connectivity.onControlAction = { [weak self] action in
            self?.handle(action: action)
        }
        motion.onRepDetected = { [weak self] in
            guard let self else { return }
            let setWasCompleted = self.engine.currentEntry.map { self.engine.snapshot.repsInCurrentSet + 1 >= $0.reps } ?? false
            self.engine.registerRep()
            // ✅ FIX #7 (Watch): the wrist is the natural place for rep feedback —
            // a light click per rep, a stronger success tap when the set completes.
            WKInterfaceDevice.current().play(setWasCompleted ? .success : .click)
        }

        engine.$snapshot
            .sink { [weak self] snapshot in
                self?.connectivity.sendSnapshot(snapshot)
                self?.syncMotionPattern()
            }
            .store(in: &cancellables)
    }

    public func requestAuthorization() async {
        await health.requestAuthorization()
    }

    public func start(plan: WorkoutPlan) {
        guard engine.plan?.id != plan.id else { return } // already running this plan
        engine.start(plan)
        health.startWorkout()
        syncMotionPattern()
        startMetricsSync()
    }

    public func handle(action: ControlAction) {
        switch action {
        // ✅ FIX #8 (Watch parity): `syncMotionPattern()` (triggered by the snapshot
        // sink below) now stops motion tracking on the `.paused` transition — see its
        // comment. Previously it kept restarting `CMMotionManager` updates at 50Hz on
        // the wrist for the whole duration of the pause.
        case .pause: WKInterfaceDevice.current().play(.click); engine.pause(); health.pause()
        case .resume: WKInterfaceDevice.current().play(.click); engine.resume(); health.resume()
        case .completeSet: WKInterfaceDevice.current().play(.success); engine.completeSet()
        case .skipExercise: WKInterfaceDevice.current().play(.click); engine.skipExercise()
        case .skipRest: WKInterfaceDevice.current().play(.click); engine.skipRest()
        case .end: Task { await endWorkout() }
        }
    }

    public func endWorkout() async {
        motion.stop()
        metricsSyncTimer?.cancel()
        _ = await health.endWorkout()
        connectivity.sendEndWorkout()
        engine.end()
    }

    private func syncMotionPattern() {
        // ✅ FIX #8 (root cause): this runs on every snapshot change, including the
        // transition into `.paused`/`.done`. Without this guard it would blindly call
        // `motion.start(...)` again right after `engine.pause()`, keeping the
        // accelerometer running (and draining battery) for the whole pause.
        guard engine.snapshot.state != .paused, engine.snapshot.state != .done else {
            motion.stop()
            return
        }
        guard let entry = engine.currentEntry, let exercise = ExerciseLibrary.byId[entry.exerciseId] else {
            motion.stop()
            return
        }
        motion.start(pattern: exercise.motionPattern)
    }

    private func startMetricsSync() {
        metricsSyncTimer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self else { return }
                self.health.recordReps(self.engine.snapshot.repsInCurrentSet)
                self.connectivity.sendLiveMetrics(self.health.liveMetrics)
            }
    }
}
