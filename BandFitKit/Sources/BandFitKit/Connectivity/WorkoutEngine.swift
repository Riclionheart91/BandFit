import Foundation
import Combine

/// Drives set/rest/timer progression for an active WorkoutPlan.
/// Identical logic runs on the Watch (the normal "source of truth" while worn)
/// and on the iPhone (fallback when no Watch is paired/worn).
@MainActor
public final class WorkoutEngine: ObservableObject {
    @Published public private(set) var plan: WorkoutPlan?
    @Published public private(set) var snapshot = WorkoutSnapshot()

    private var timer: AnyCancellable?
    private var startedAt: Date?

    public init() {}

    public var currentEntry: WorkoutExerciseEntry? {
        guard let plan, snapshot.exerciseIndex < plan.entries.count else { return nil }
        return plan.entries[snapshot.exerciseIndex]
    }

    public var nextEntry: WorkoutExerciseEntry? {
        guard let plan, snapshot.exerciseIndex + 1 < plan.entries.count else { return nil }
        return plan.entries[snapshot.exerciseIndex + 1]
    }

    /// Minimum, clearly-visible pause whenever moving from one set to the next — makes
    /// the transition obvious even if a custom plan has little/no configured rest.
    public static let minimumSetTransitionSeconds = 5
    /// Fixed hydration break offered when the person skips an exercise entirely.
    public static let hydrationBreakSeconds = 30

    private var stateBeforePause: WorkoutState = .active

    public func start(_ plan: WorkoutPlan) {
        self.plan = plan
        snapshot = WorkoutSnapshot(state: .active, exerciseIndex: 0, setIndex: 0, elapsedSeconds: 0, restRemainingSeconds: 0, repsInCurrentSet: 0)
        startedAt = Date()
        runTimer()
    }

    public func pause() {
        guard snapshot.state == .active || snapshot.state == .rest || snapshot.state == .hydration else { return }
        stateBeforePause = snapshot.state
        snapshot.state = .paused
        timer?.cancel()
    }

    public func resume() {
        guard snapshot.state == .paused else { return }
        snapshot.state = stateBeforePause
        runTimer()
    }

    /// Called when a set finishes (either the target reps were auto-detected, or the
    /// person tapped "Set completato" manually). Always inserts at least a
    /// `minimumSetTransitionSeconds` pause so the change of set/exercise is unmistakable.
    /// FIX: Reset elapsedSeconds immediately (not waiting for next tick) for smooth UI.
    public func completeSet() {
        guard let plan, let entry = currentEntry else { return }
        snapshot.repsInCurrentSet = 0
        snapshot.elapsedSeconds = 0  // ✅ IMMEDIATE RESET — smooth UI transition
        
        let restLength = max(Self.minimumSetTransitionSeconds, entry.restSeconds)
        if snapshot.setIndex + 1 < entry.sets {
            snapshot.setIndex += 1
            snapshot.state = .rest
            snapshot.restRemainingSeconds = restLength
        } else if snapshot.exerciseIndex + 1 < plan.entries.count {
            snapshot.exerciseIndex += 1
            snapshot.setIndex = 0
            snapshot.state = .rest
            snapshot.restRemainingSeconds = restLength
        } else {
            snapshot.state = .done
            timer?.cancel()
        }
    }

    /// Person tapped "salta esercizio": jump straight to the next exercise, but offer a
    /// 30s hydration break first (with its own skip button in the UI) rather than
    /// dropping them into the next set with zero warning.
    public func skipExercise() {
        guard let plan else { return }
        if snapshot.exerciseIndex + 1 < plan.entries.count {
            snapshot.exerciseIndex += 1
            snapshot.setIndex = 0
            snapshot.repsInCurrentSet = 0
            snapshot.elapsedSeconds = 0  // ✅ RESET on exercise change
            snapshot.state = .hydration
            snapshot.restRemainingSeconds = Self.hydrationBreakSeconds
        } else {
            snapshot.state = .done
            timer?.cancel()
        }
    }

    /// Skips whatever rest/hydration countdown is currently running and jumps straight
    /// into the next active set.
    public func skipRest() {
        guard snapshot.state == .rest || snapshot.state == .hydration else { return }
        snapshot.state = .active
        snapshot.restRemainingSeconds = 0
        snapshot.elapsedSeconds = 0  // ✅ RESET on rest skip
    }

    public func registerRep() {
        guard snapshot.state == .active, let entry = currentEntry else { return }
        snapshot.repsInCurrentSet += 1
        if snapshot.repsInCurrentSet >= entry.reps {
            completeSet()
        }
    }

    public func end() {
        timer?.cancel()
        plan = nil
        snapshot = WorkoutSnapshot()
    }

    /// Apply an authoritative snapshot received from the other device (Watch<->iPhone sync).
    public func apply(remoteSnapshot: WorkoutSnapshot) {
        self.snapshot = remoteSnapshot
    }

    public func apply(remotePlan: WorkoutPlan) {
        self.plan = remotePlan
    }

    private func runTimer() {
        timer?.cancel()
        timer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.tick()
            }
    }

    private func tick() {
        switch snapshot.state {
        case .active:
            snapshot.elapsedSeconds += 1
        case .rest, .hydration:
            if snapshot.restRemainingSeconds > 0 {
                snapshot.restRemainingSeconds -= 1
            } else {
                // ✅ FIX: elapsedSeconds is already 0 from completeSet() or skipRest()
                // Don't reset here to avoid UI jank
                snapshot.state = .active
            }
        default:
            break
        }
    }
}
