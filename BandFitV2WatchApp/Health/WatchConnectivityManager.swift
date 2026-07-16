import Foundation
import WatchConnectivity
import BandFitKit

@MainActor
public final class WatchConnectivityManager: NSObject, ObservableObject {
    public static let shared = WatchConnectivityManager()

    @Published public private(set) var isReachable = false
    public var onStartWorkout: ((WorkoutPlan) -> Void)?
    public var onControlAction: ((ControlAction) -> Void)?

    private let session: WCSession? = WCSession.isSupported() ? .default : nil

    override private init() {
        super.init()
        session?.delegate = self
        session?.activate()
    }

    public func sendSnapshot(_ snapshot: WorkoutSnapshot) {
        send(WCEnvelope(kind: .snapshotUpdate, snapshot: snapshot))
    }

    public func sendLiveMetrics(_ metrics: LiveMetrics) {
        send(WCEnvelope(kind: .liveMetrics, metrics: metrics))
    }

    public func sendEndWorkout() {
        send(WCEnvelope(kind: .endWorkout))
    }

    private func send(_ envelope: WCEnvelope) {
        guard let session, session.isReachable else { return }
        session.sendMessage(envelope.toDictionary(), replyHandler: nil, errorHandler: nil)
    }
}

extension WatchConnectivityManager: WCSessionDelegate {
    nonisolated public func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        Task { @MainActor in
            self.isReachable = session.isReachable
        }
        // Catch a startWorkout/control command that was sent via updateApplicationContext
        // while this Watch app wasn't running — otherwise it would only ever surface if
        // the delegate happens to fire session(_:didReceiveApplicationContext:) again.
        handle(session.receivedApplicationContext)
    }

    nonisolated public func sessionReachabilityDidChange(_ session: WCSession) {
        Task { @MainActor in self.isReachable = session.isReachable }
    }

    nonisolated public func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        handle(message)
    }

    nonisolated public func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        handle(applicationContext)
    }

    nonisolated public func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any]) {
        handle(userInfo)
    }

    private nonisolated func handle(_ message: [String: Any]) {
        guard let envelope = WCEnvelope.from(dictionary: message) else { return }
        Task { @MainActor in
            switch envelope.kind {
            case .startWorkout:
                if let data = envelope.planData, let plan = WorkoutPlan.decode(data) {
                    self.onStartWorkout?(plan)
                }
            case .controlAction:
                if let action = envelope.action {
                    self.onControlAction?(action)
                }
            default:
                break
            }
        }
    }
}
