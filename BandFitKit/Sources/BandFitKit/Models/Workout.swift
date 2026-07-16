import Foundation

public struct WorkoutExerciseEntry: Identifiable, Codable, Hashable, Sendable {
    public let id: UUID
    public let exerciseId: String
    public var band: BandStrength
    public var sets: Int
    public var reps: Int
    public var restSeconds: Int

    public init(id: UUID = UUID(), exerciseId: String, band: BandStrength, sets: Int, reps: Int, restSeconds: Int) {
        self.id = id
        self.exerciseId = exerciseId
        self.band = band
        self.sets = sets
        self.reps = reps
        self.restSeconds = restSeconds
    }
}

public struct WorkoutPlan: Identifiable, Codable, Hashable, Sendable {
    public let id: UUID
    public var name: String
    public var entries: [WorkoutExerciseEntry]
    public var isPredefined: Bool
    public var createdAt: Date

    public init(id: UUID = UUID(), name: String, entries: [WorkoutExerciseEntry], isPredefined: Bool = false, createdAt: Date = Date()) {
        self.id = id
        self.name = name
        self.entries = entries
        self.isPredefined = isPredefined
        self.createdAt = createdAt
    }

    public var totalSets: Int { entries.reduce(0) { $0 + $1.sets } }
    public var estimatedMinutes: Int {
        let work = entries.reduce(0) { $0 + $1.sets * 30 } // ~30s/set assumption
        let rest = entries.reduce(0) { $0 + ($1.sets - 1) * $1.restSeconds }
        return max(1, (work + rest) / 60)
    }
}

public enum WorkoutState: String, Codable, Sendable {
    case idle, active, rest, hydration, paused, done
}

/// Point-in-time snapshot of an in-progress workout, sent from iPhone to Watch (and vice versa)
/// so both devices show identical state.
public struct WorkoutSnapshot: Codable, Sendable {
    public var state: WorkoutState
    public var exerciseIndex: Int
    public var setIndex: Int
    public var elapsedSeconds: Int
    public var restRemainingSeconds: Int
    public var repsInCurrentSet: Int

    public init(state: WorkoutState = .idle, exerciseIndex: Int = 0, setIndex: Int = 0, elapsedSeconds: Int = 0, restRemainingSeconds: Int = 0, repsInCurrentSet: Int = 0) {
        self.state = state
        self.exerciseIndex = exerciseIndex
        self.setIndex = setIndex
        self.elapsedSeconds = elapsedSeconds
        self.restRemainingSeconds = restRemainingSeconds
        self.repsInCurrentSet = repsInCurrentSet
    }
}

/// Live biometric + rep data. Produced on the Watch (source of truth when worn),
/// mirrored to the iPhone over WatchConnectivity in real time.
public struct LiveMetrics: Codable, Sendable, Equatable {
    public var heartRateBPM: Double?
    public var activeCalories: Double
    public var bloodOxygenPercent: Double?     // e.g. 0.97 = 97%. nil until a reading arrives.
    public var reps: Int

    public init(heartRateBPM: Double? = nil, activeCalories: Double = 0, bloodOxygenPercent: Double? = nil, reps: Int = 0) {
        self.heartRateBPM = heartRateBPM
        self.activeCalories = activeCalories
        self.bloodOxygenPercent = bloodOxygenPercent
        self.reps = reps
    }
}

/// Completed workout record, persisted locally and mirrored to HealthKit.
public struct WorkoutHistoryEntry: Identifiable, Codable, Sendable {
    public let id: UUID
    public let planName: String
    public let startDate: Date
    public let endDate: Date
    public let totalReps: Int
    public let averageHeartRate: Double?
    public let maxHeartRate: Double?
    public let activeCalories: Double
    public let averageBloodOxygen: Double?

    public init(id: UUID = UUID(), planName: String, startDate: Date, endDate: Date, totalReps: Int, averageHeartRate: Double?, maxHeartRate: Double?, activeCalories: Double, averageBloodOxygen: Double?) {
        self.id = id
        self.planName = planName
        self.startDate = startDate
        self.endDate = endDate
        self.totalReps = totalReps
        self.averageHeartRate = averageHeartRate
        self.maxHeartRate = maxHeartRate
        self.activeCalories = activeCalories
        self.averageBloodOxygen = averageBloodOxygen
    }

    public var duration: TimeInterval { endDate.timeIntervalSince(startDate) }
}
