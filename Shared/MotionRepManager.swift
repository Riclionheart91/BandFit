import Foundation
import CoreMotion
import BandFitKit

/// Reads the Watch's accelerometer/gyro at 50Hz and feeds magnitude samples into the
/// shared RepDetector. The Watch is the preferred source for rep counting since it's
/// strapped to the wrist doing the actual band movement (far cleaner signal than the
/// phone sitting on a shelf).
@MainActor
public final class MotionRepManager {
    private let motionManager = CMMotionManager()
    private let detector: RepDetector
    public var onRepDetected: (() -> Void)? {
        didSet { detector.onRepDetected = onRepDetected }
    }

    private var currentPattern: RepMotionPattern = .verticalPress

    public init() {
        detector = RepDetector(thresholds: .default(for: .verticalPress))
        motionManager.deviceMotionUpdateInterval = 1.0 / 50.0
    }

    public func start(pattern: RepMotionPattern) {
        currentPattern = pattern
        detector.updateThresholds(for: pattern)
        detector.reset()
        guard motionManager.isDeviceMotionAvailable else { return }
        motionManager.startDeviceMotionUpdates(to: .main) { [weak self] motion, _ in
            guard let self, let motion else { return }
            self.process(motion)
        }
    }

    public func stop() {
        motionManager.stopDeviceMotionUpdates()
    }

    public func switchPattern(_ pattern: RepMotionPattern) {
        currentPattern = pattern
        detector.updateThresholds(for: pattern)
        detector.reset()
    }

    private func process(_ motion: CMDeviceMotion) {
        switch currentPattern {
        case .rotational:
            let r = motion.rotationRate
            let magnitude = sqrt(r.x * r.x + r.y * r.y + r.z * r.z) / 6.0 + 1.0 // normalize roughly around 1.0 baseline
            detector.ingest(magnitude: magnitude)
        default:
            let a = motion.userAcceleration
            let magnitude = sqrt(a.x * a.x + a.y * a.y + a.z * a.z) + 1.0 // +1g so it centers near the same thresholds as gravity-inclusive
            detector.ingest(magnitude: magnitude)
        }
    }
}
