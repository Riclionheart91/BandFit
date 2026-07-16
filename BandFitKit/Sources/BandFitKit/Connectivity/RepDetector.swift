import Foundation

/// Threshold-based peak detector for counting resistance-band repetitions from raw
/// motion samples. Pure Swift/Foundation so it can be unit-tested and shared between
/// the Watch (CMMotionManager deviceMotion, primary source while worn) and the iPhone
/// (fallback when training without a Watch).
///
/// Algorithm (per rep):
///   1. Caller feeds the magnitude of user-acceleration (gravity removed), or the
///      rotation-rate magnitude for rotational exercises, at ~50Hz.
///   2. Exponential moving average (alpha) smooths jitter.
///   3. A rep is counted on a full crossing: signal rises above `upperThreshold`,
///      then falls back below `lowerThreshold`, with a minimum refractory period
///      between reps to reject noise/double-counts.
public final class RepDetector {
    public struct Thresholds {
        public var upper: Double
        public var lower: Double
        public var minIntervalSeconds: TimeInterval
        public var smoothing: Double // EMA alpha, 0..1

        public init(upper: Double, lower: Double, minIntervalSeconds: TimeInterval, smoothing: Double = 0.2) {
            self.upper = upper
            self.lower = lower
            self.minIntervalSeconds = minIntervalSeconds
            self.smoothing = smoothing
        }

        /// Reasonable defaults per exercise motion pattern (band exercises are slower/
        /// more controlled than bodyweight, so thresholds are tuned lower than a typical
        /// running/jump-rope cadence detector).
        public static func `default`(for pattern: RepMotionPattern) -> Thresholds {
            switch pattern {
            case .verticalPress:
                return Thresholds(upper: 1.35, lower: 0.75, minIntervalSeconds: 0.5)
            case .rotational:
                return Thresholds(upper: 1.6, lower: 0.8, minIntervalSeconds: 0.45)
            case .lateralPull:
                return Thresholds(upper: 1.3, lower: 0.75, minIntervalSeconds: 0.5)
            case .squatJump:
                return Thresholds(upper: 1.5, lower: 0.7, minIntervalSeconds: 0.6)
            }
        }
    }

    private var baseThresholds: Thresholds
    private var thresholds: Thresholds
    private var smoothed: Double = 1.0 // 1g baseline
    private var armed = false // true once we've crossed upper and are waiting for the down-crossing
    private var lastRepAt: Date = .distantPast
    public var onRepDetected: (() -> Void)?

    // ✅ FIX #5: the hardcoded per-pattern thresholds are only used as a *starting
    // point* now. As real reps are observed we nudge `upper`/`lower` towards the
    // actual peak/trough this person + band combo is producing, which is what was
    // causing under/overcounting for anyone whose motion amplitude didn't match the
    // fixed defaults (stronger/weaker band, bigger/smaller range of motion, etc).
    private var peakDuringRep: Double = 1.0
    private var troughAfterRep: Double = 1.0
    /// How strongly each observed rep nudges the thresholds towards the person's
    /// actual amplitude. Kept low so a couple of noisy samples can't swing things wildly.
    private let calibrationRate = 0.15
    /// Thresholds are only ever allowed to drift within this fraction of the original
    /// default — keeps calibration from wandering so far it stops rejecting noise.
    private let maxDriftFraction = 0.35

    public init(thresholds: Thresholds) {
        self.baseThresholds = thresholds
        self.thresholds = thresholds
    }

    public func updateThresholds(for pattern: RepMotionPattern) {
        baseThresholds = .default(for: pattern)
        thresholds = baseThresholds
    }

    public func reset() {
        smoothed = 1.0
        armed = false
        lastRepAt = .distantPast
        peakDuringRep = 1.0
        troughAfterRep = 1.0
    }

    /// Feed one magnitude sample (in g, ~1.0 at rest).
    public func ingest(magnitude: Double, at date: Date = Date()) {
        smoothed = thresholds.smoothing * magnitude + (1 - thresholds.smoothing) * smoothed

        if !armed {
            if smoothed >= thresholds.upper {
                armed = true
                peakDuringRep = smoothed
            }
        } else {
            peakDuringRep = max(peakDuringRep, smoothed)
            if smoothed <= thresholds.lower {
                troughAfterRep = smoothed
                let sinceLast = date.timeIntervalSince(lastRepAt)
                if sinceLast >= thresholds.minIntervalSeconds {
                    lastRepAt = date
                    onRepDetected?()
                    calibrate(peak: peakDuringRep, trough: troughAfterRep)
                }
                armed = false
            }
        }
    }

    /// Slides `upper`/`lower` a little closer to this rep's observed peak/trough,
    /// clamped to stay within `maxDriftFraction` of the pattern's original defaults.
    private func calibrate(peak: Double, trough: Double) {
        let targetUpper = trough + (peak - trough) * 0.65
        let targetLower = trough + (peak - trough) * 0.25

        let minUpper = baseThresholds.upper * (1 - maxDriftFraction)
        let maxUpper = baseThresholds.upper * (1 + maxDriftFraction)
        let minLower = baseThresholds.lower * (1 - maxDriftFraction)
        let maxLower = baseThresholds.lower * (1 + maxDriftFraction)

        let newUpper = (thresholds.upper + calibrationRate * (targetUpper - thresholds.upper))
            .clamped(to: minUpper...maxUpper)
        let newLower = (thresholds.lower + calibrationRate * (targetLower - thresholds.lower))
            .clamped(to: minLower...maxLower)

        // Never let lower drift up past upper (or vice versa) — keep a safety gap.
        guard newUpper - newLower > 0.05 else { return }
        thresholds.upper = newUpper
        thresholds.lower = newLower
    }
}

private extension Double {
    func clamped(to range: ClosedRange<Double>) -> Double {
        min(max(self, range.lowerBound), range.upperBound)
    }
}
