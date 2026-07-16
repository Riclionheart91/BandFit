import Foundation

/// Every message that crosses the iPhone <-> Watch boundary goes through one of these
/// cases, encoded as JSON in the WatchConnectivity `userInfo`/`message` dictionary under
/// the "kind" + "payload" keys. Keeping this in BandFitKit means both targets share the
/// exact same wire format and can never drift out of sync.
public enum WCMessageKind: String, Codable, Sendable {
    case startWorkout        // iPhone -> Watch: here is the plan, please start mirroring it
    case snapshotUpdate       // either direction: authoritative state (timer/state/set index)
    case liveMetrics          // Watch -> iPhone: HR / calories / SpO2 / reps, ~1/sec
    case controlAction        // either direction: user tapped pause/resume/completeSet/skip/end
    case endWorkout           // either direction: workout finished, stop mirroring
    case reachabilityPing     // lightweight "are you there" used at launch
}

public enum ControlAction: String, Codable, Sendable {
    case pause, resume, completeSet, skipExercise, skipRest, end
}

public struct WCEnvelope: Codable, Sendable {
    public let kind: WCMessageKind
    public let planData: Data?
    public let snapshot: WorkoutSnapshot?
    public let metrics: LiveMetrics?
    public let action: ControlAction?

    public init(kind: WCMessageKind, planData: Data? = nil, snapshot: WorkoutSnapshot? = nil, metrics: LiveMetrics? = nil, action: ControlAction? = nil) {
        self.kind = kind
        self.planData = planData
        self.snapshot = snapshot
        self.metrics = metrics
        self.action = action
    }

    public func toDictionary() -> [String: Any] {
        guard let data = try? JSONEncoder().encode(self) else { return [:] }
        return ["envelope": data]
    }

    public static func from(dictionary: [String: Any]) -> WCEnvelope? {
        guard let data = dictionary["envelope"] as? Data else { return nil }
        return try? JSONDecoder().decode(WCEnvelope.self, from: data)
    }
}

public extension WorkoutPlan {
    func encoded() -> Data? { try? JSONEncoder().encode(self) }
    static func decode(_ data: Data) -> WorkoutPlan? { try? JSONDecoder().decode(WorkoutPlan.self, from: data) }
}
