import UIKit

/// "Niente haptic feedback" fix — centralizes the few taps/vibrations the iPhone app
/// gives during a workout, so callers don't have to instantiate/prepare generators
/// themselves. `UIImpactFeedbackGenerator`/`UINotificationFeedbackGenerator` are
/// cheap to create but should be `prepare()`d slightly ahead of the actual feedback
/// for the lowest latency, which is what `prepareForWorkout()` is for.
enum HapticFeedback {
    private static let repGenerator = UIImpactFeedbackGenerator(style: .light)
    private static let setCompleteGenerator = UINotificationFeedbackGenerator()
    private static let controlGenerator = UIImpactFeedbackGenerator(style: .medium)

    /// Call once when a workout starts so the first haptic isn't delayed.
    static func prepareForWorkout() {
        repGenerator.prepare()
        setCompleteGenerator.prepare()
    }

    /// Every counted repetition — short, light tap.
    static func repDetected() {
        repGenerator.impactOccurred()
        repGenerator.prepare()
    }

    /// A set (or the whole workout) is completed — success notification buzz.
    static func setCompleted() {
        setCompleteGenerator.notificationOccurred(.success)
    }

    /// Generic control taps (pause/resume/skip) — medium tap for confirmation.
    static func controlTapped() {
        controlGenerator.impactOccurred()
        controlGenerator.prepare()
    }
}
