import Foundation

/// Resistance band color/strength, matches the physical bands (rosso/verde/blu ecc.)
public enum BandStrength: String, Codable, CaseIterable, Identifiable, Hashable, Sendable {
    case red, green, blue, black, yellow, purple

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .red: return "Rosso"
        case .green: return "Verde"
        case .blue: return "Blu"
        case .black: return "Nero"
        case .yellow: return "Giallo"
        case .purple: return "Viola"
        }
    }

    /// Hex used for tinting UI elements; matches theme.ts bandHex from the original app.
    public var hex: String {
        switch self {
        case .red: return "#E5484D"
        case .green: return "#30A46C"
        case .blue: return "#0091FF"
        case .black: return "#1A1A1A"
        case .yellow: return "#F5D90A"
        case .purple: return "#8E4EC6"
        }
    }
}

public enum MuscleGroup: String, Codable, CaseIterable, Identifiable, Sendable {
    case chest, back, shoulders, arms, legs, glutes, core, fullBody

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .chest: return "Petto"
        case .back: return "Schiena"
        case .shoulders: return "Spalle"
        case .arms: return "Braccia"
        case .legs: return "Gambe"
        case .glutes: return "Glutei"
        case .core: return "Core"
        case .fullBody: return "Full Body"
        }
    }
}

/// Which motion axis the rep counter should watch for this exercise, so the
/// CoreMotion peak detector on iPhone/Watch knows what "one rep" looks like.
public enum RepMotionPattern: String, Codable, Sendable {
    case verticalPress   // curls, presses: dominant motion along device Y/Z
    case rotational      // rotational moves: wrist/forearm rotation (CMRotationRate)
    case lateralPull     // rows, pulls: lateral acceleration
    case squatJump       // lower body: vertical acceleration on the phone in a pocket/armband
}

public struct Exercise: Identifiable, Codable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let muscleGroups: [MuscleGroup]
    public let defaultBand: BandStrength
    public let instructions: String
    public let motionPattern: RepMotionPattern
    public let imageSystemName: String

    public init(id: String, name: String, muscleGroups: [MuscleGroup], defaultBand: BandStrength, instructions: String, motionPattern: RepMotionPattern, imageSystemName: String = "figure.strengthtraining.functional") {
        self.id = id
        self.name = name
        self.muscleGroups = muscleGroups
        self.defaultBand = defaultBand
        self.instructions = instructions
        self.motionPattern = motionPattern
        self.imageSystemName = imageSystemName
    }
}
