import Foundation
import Combine
import BandFitKit

@MainActor
public final class PhoneWorkoutCoordinator: ObservableObject {
    public let engine = WorkoutEngine()
    public let health = PhoneHealthManager()
    public let connectivity = PhoneConnectivityManager.shared
    private let motion = MotionRepManager()

    @Published public private(set) var liveMetrics = LiveMetrics()
    @Published public private(set) var usingWatch = false

    private var cancellables = Set<AnyCancellable>()

    public init() {
        // BUG FIX: `engine`, `health` and `connectivity` are separate ObservableObjects.
        // Just holding them as plain properties does NOT make SwiftUI re-render when
        // THEY change — only when `coordinator`'s own @Published properties change.
        // Without this, the timer/reps/state updated internally every second but the
        // screen never refreshed, which is exactly the "nothing happens" symptom.
        engine.objectWillChange
            .sink { [weak self] _ in self?.objectWillChange.send() }
            .store(in: &cancellables)
        health.objectWillChange
            .sink { [weak self] _ in self?.objectWillChange.send() }
            .store(in: &cancellables)
        connectivity.objectWillChange
            .sink { [weak self] _ in self?.objectWillChange.send() }
            .store(in: &cancellables)

        connectivity.onSnapshotUpdate = { [weak self] snapshot in
            self?.usingWatch = true
            self?.engine.apply(remoteSnapshot: snapshot)
        }
        connectivity.onLiveMetrics = { [weak self] metrics in
            self?.liveMetrics = metrics
        }
        connectivity.onWorkoutEnded = { [weak self] in
            self?.engine.end()
            Task { await self?.health.loadHistory() }
        }
        motion.onRepDetected = { [weak self] in
            guard let self, self.usingWatch == false else { return }
            let setWasCompleted = self.engine.currentEntry.map { self.liveMetrics.reps + 1 >= $0.reps } ?? false
            self.engine.registerRep()
            self.liveMetrics.reps = self.engine.snapshot.repsInCurrentSet
            // ✅ FIX #2: Record metrics to HealthKit immediately
            self.health.recordMetrics(reps: self.liveMetrics.reps, calories: self.liveMetrics.activeCalories)
            // ✅ FIX #7: Haptic feedback per repetizione contata, distinto quando la serie si completa
            if setWasCompleted {
                HapticFeedback.setCompleted()
            } else {
                HapticFeedback.repDetected()
            }
        }
    }

    public func requestAuthorization() async {
        await health.requestAuthorization()
    }

    /// The user tapped "Avvia" on the iPhone. If a Watch is reachable we hand the plan
    /// off to it (it becomes the source of truth: HR/calories/SpO2/reps all come from
    /// the wrist). If no Watch is around/reachable right now we still send the plan
    /// (delivered the moment the Watch app opens, see PhoneConnectivityManager), but the
    /// iPhone + its accelerometer take over immediately as a fallback so the workout
    /// isn't blocked waiting for the Watch.
    ///
    /// ✅ FIX #2: CRITICAL — Only start the local engine timer if NOT using Watch.
    /// If Watch is reachable, we wait for the remote snapshot from Watch before
    /// running our own timer. This prevents two parallel timers.
    public func start(plan: WorkoutPlan) {
        usingWatch = connectivity.isReachable
        connectivity.sendStartWorkout(plan)
        HapticFeedback.prepareForWorkout()
        
        if usingWatch {
            // ✅ Watch will become source of truth. Don't start local timer yet.
            // The coordinator will receive onSnapshotUpdate when Watch is ready,
            // and that callback will set engine.plan via apply(remotePlan:)
            // For now, just prepare the engine state without starting the timer.
            engine.plan = plan
        } else {
            // ✅ No Watch — iPhone is the source of truth. Start everything.
            engine.start(plan)
            health.startWorkoutSession()  // ✅ FIX #3: Save workouts locally
            syncMotionPattern()
        }
    }

    public func pause() {
        HapticFeedback.controlTapped()
        if usingWatch { 
            connectivity.sendControlAction(.pause) 
        } else { 
            engine.pause()
            motion.stop()  // ✅ FIX #8: Stop motion during pause (battery optimization)
        }
    }

    public func resume() {
        HapticFeedback.controlTapped()
        if usingWatch { 
            connectivity.sendControlAction(.resume) 
        } else { 
            engine.resume()
            syncMotionPattern()  // ✅ Resume motion tracking
        }
    }

    public func completeSet() {
        HapticFeedback.setCompleted()
        if usingWatch {
            connectivity.sendControlAction(.completeSet)
        } else {
            engine.completeSet()
            syncMotionPattern()
        }
    }

    public func skipExercise() {
        HapticFeedback.controlTapped()
        if usingWatch {
            connectivity.sendControlAction(.skipExercise)
        } else {
            engine.skipExercise()
            syncMotionPattern()
        }
    }

    public func skipRest() {
        HapticFeedback.controlTapped()
        if usingWatch {
            connectivity.sendControlAction(.skipRest)
        } else {
            engine.skipRest()
        }
    }

    public func end() async {
        if usingWatch {
            connectivity.sendControlAction(.end)
        } else {
            motion.stop()
            // ✅ FIX #3: End the HealthKit session and save the workout
            let entry = await health.endWorkoutSession()
            if let entry {
                print("[PhoneWorkoutCoordinator] Allenamento salvato: \(entry.planName)")
            }
        }
        engine.end()
        await health.loadHistory()
    }

    /// User explicitly cancelled the workout (as opposed to reaching the end of the
    /// plan). Functionally the same cleanup as `end()`, kept as its own entry point so
    /// the UI/confirmation flow stays clear and future-proof if cancel vs. finish ever
    /// need to diverge (e.g. discarding vs. saving a partial HealthKit workout).
    public func cancel() async {
        await end()
    }

    private func syncMotionPattern() {
        guard let entry = engine.currentEntry, let exercise = ExerciseLibrary.byId[entry.exerciseId] else {
            motion.stop()
            return
        }
        motion.start(pattern: exercise.motionPattern)
    }
}
