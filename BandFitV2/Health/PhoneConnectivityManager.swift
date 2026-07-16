import Foundation
import WatchConnectivity
import BandFitKit

@MainActor
public final class PhoneConnectivityManager: NSObject, ObservableObject {
    public static let shared = PhoneConnectivityManager()

    @Published public private(set) var isWatchAppInstalled = false
    @Published public private(set) var isReachable = false
    // ✅ FIX #6: surfaced to the UI (e.g. a small banner) instead of only being printed,
    // so a silent WatchConnectivity failure is no longer invisible to the person.
    @Published public private(set) var syncWarning: String?
    public var onSnapshotUpdate: ((WorkoutSnapshot) -> Void)?
    public var onLiveMetrics: ((LiveMetrics) -> Void)?
    public var onWorkoutEnded: (() -> Void)?

    private let session: WCSession? = WCSession.isSupported() ? .default : nil
    /// How many times we automatically retry a failed `sendMessage` before giving up
    /// and just relying on the context/userInfo fallback channels.
    private let maxSendRetries = 2

    override private init() {
        super.init()
        session?.delegate = self
        session?.activate()
    }

    public func sendStartWorkout(_ plan: WorkoutPlan) {
        guard let data = plan.encoded() else { return }
        let envelope = WCEnvelope(kind: .startWorkout, planData: data)
        // sendMessage only works if the Watch app is actively running/reachable right
        // now — that's the #1 reason "avvia da iPhone" can silently do nothing. As a
        // fallback we ALSO push it via updateApplicationContext (always delivered, the
        // Watch app picks it up the moment it launches/wakes) and transferUserInfo
        // (queued for guaranteed background delivery). Belt and suspenders.
        send(envelope)
        updateContext(envelope)
        transferQueued(envelope)
    }

    public func sendControlAction(_ action: ControlAction) {
        send(WCEnvelope(kind: .controlAction, action: action))
    }

    private func send(_ envelope: WCEnvelope, attempt: Int = 0) {
        guard let session, session.isReachable else {
            let message = "Watch non raggiungibile ora — invio via canale di riserva."
            print("[PhoneConnectivityManager] \(message)")
            syncWarning = message
            return
        }
        session.sendMessage(envelope.toDictionary(), replyHandler: { [weak self] _ in
            // Success: clear any stale warning from a previous failed attempt.
            Task { @MainActor in self?.syncWarning = nil }
        }) { [weak self] error in
            print("[PhoneConnectivityManager] sendMessage error (attempt \(attempt)): \(error)")
            guard let self else { return }
            Task { @MainActor in
                if attempt < self.maxSendRetries {
                    // ✅ FIX #6: retry a couple of times before surfacing a warning —
                    // most failures are transient (brief radio hiccup).
                    try? await Task.sleep(nanoseconds: 300_000_000)
                    self.send(envelope, attempt: attempt + 1)
                } else {
                    self.syncWarning = "Sincronizzazione con l'Apple Watch non riuscita. Riprovo in background."
                }
            }
        }
    }

    private func updateContext(_ envelope: WCEnvelope) {
        guard let session else { return }
        do {
            try session.updateApplicationContext(envelope.toDictionary())
        } catch {
            print("[PhoneConnectivityManager] updateApplicationContext error: \(error)")
        }
    }

    private func transferQueued(_ envelope: WCEnvelope) {
        guard let session else { return }
        session.transferUserInfo(envelope.toDictionary())
    }
}

extension PhoneConnectivityManager: WCSessionDelegate {
    nonisolated public func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        Task { @MainActor in
            self.isReachable = session.isReachable
            self.isWatchAppInstalled = session.isWatchAppInstalled
        }
    }

    nonisolated public func sessionDidBecomeInactive(_ session: WCSession) {}
    nonisolated public func sessionDidDeactivate(_ session: WCSession) { session.activate() }

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
            case .snapshotUpdate:
                if let snapshot = envelope.snapshot { self.onSnapshotUpdate?(snapshot) }
            case .liveMetrics:
                if let metrics = envelope.metrics { self.onLiveMetrics?(metrics) }
            case .endWorkout:
                self.onWorkoutEnded?()
            default:
                break
            }
        }
    }
}
