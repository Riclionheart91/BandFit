import Foundation

/// Static exercise library, ported 1:1 from the original React Native app's exercises.ts.
public enum ExerciseLibrary {
    public static let all: [Exercise] = [
        Exercise(id: "thruster", name: "Thruster", muscleGroups: [.legs, .shoulders, .glutes], defaultBand: .black, instructions: "In piedi, elastico sotto i piedi. Spingi verso l'alto estendendo gambe e braccia insieme.", motionPattern: .squatJump, imageSystemName: "figure.strengthtraining.functional"),

        Exercise(id: "std-chest-press", name: "Distensioni Petto in Piedi", muscleGroups: [.chest, .arms, .shoulders], defaultBand: .red, instructions: "Elastico dietro la schiena, spingi le maniglie in avanti all'altezza del petto.", motionPattern: .verticalPress, imageSystemName: "figure.strengthtraining.traditional"),
        Exercise(id: "chest-fly", name: "Croci Petto", muscleGroups: [.chest], defaultBand: .red, instructions: "Elastico dietro la schiena, apri e chiudi le braccia come in un abbraccio.", motionPattern: .lateralPull, imageSystemName: "figure.strengthtraining.traditional"),
        Exercise(id: "push-up", name: "Piegamenti", muscleGroups: [.chest, .arms, .core], defaultBand: .black, instructions: "Elastico sulla schiena, esegui piegamenti sulle braccia.", motionPattern: .verticalPress, imageSystemName: "figure.core.training"),
        Exercise(id: "bicep-curl", name: "Curl Bicipiti", muscleGroups: [.arms], defaultBand: .red, instructions: "Piedi sull'elastico, piega gli avambracci verso le spalle.", motionPattern: .rotational, imageSystemName: "dumbbell"),
        Exercise(id: "tricep-pushdown", name: "Push-down Tricipiti", muscleGroups: [.arms], defaultBand: .yellow, instructions: "Elastico ancorato in alto, spingi verso il basso estendendo i gomiti.", motionPattern: .verticalPress, imageSystemName: "dumbbell"),
        Exercise(id: "tricep-kickback", name: "Kickback Tricipiti", muscleGroups: [.arms], defaultBand: .yellow, instructions: "Busto inclinato, estendi il braccio all'indietro.", motionPattern: .rotational, imageSystemName: "dumbbell"),
        Exercise(id: "overhead-tricep", name: "Estensioni Tricipiti", muscleGroups: [.arms], defaultBand: .yellow, instructions: "Elastico dietro la testa, estendi le braccia verso l'alto.", motionPattern: .verticalPress, imageSystemName: "dumbbell"),
        Exercise(id: "single-lat-pulldown", name: "Lat Pulldown Singolo", muscleGroups: [.back], defaultBand: .red, instructions: "Elastico ancorato in alto, tira verso il basso con un braccio.", motionPattern: .lateralPull, imageSystemName: "figure.rower"),
        Exercise(id: "lat-pulldown", name: "Lat Pulldown", muscleGroups: [.back], defaultBand: .black, instructions: "Elastico ancorato in alto, tira verso il basso con entrambe le braccia.", motionPattern: .lateralPull, imageSystemName: "figure.rower"),
        Exercise(id: "upright-row", name: "Rematore Verticale", muscleGroups: [.shoulders, .back], defaultBand: .black, instructions: "Piedi sull'elastico, tira verso il mento con i gomiti alti.", motionPattern: .verticalPress, imageSystemName: "figure.rower"),
        Exercise(id: "face-pull", name: "Face Pull", muscleGroups: [.shoulders, .back], defaultBand: .red, instructions: "Elastico ancorato davanti, tira verso il viso separando le mani.", motionPattern: .lateralPull, imageSystemName: "figure.rower"),
        Exercise(id: "shoulder-press", name: "Lento Spalle", muscleGroups: [.shoulders, .arms], defaultBand: .red, instructions: "Piedi sull'elastico, spingi verso l'alto sopra la testa.", motionPattern: .verticalPress, imageSystemName: "figure.strengthtraining.traditional"),
        Exercise(id: "ext-rotation", name: "Rotazione Esterna Spalle", muscleGroups: [.shoulders], defaultBand: .yellow, instructions: "Gomito fermo al fianco, ruota l'avambraccio verso l'esterno.", motionPattern: .rotational, imageSystemName: "figure.flexibility"),
        Exercise(id: "front-raise", name: "Alzate Frontali", muscleGroups: [.shoulders], defaultBand: .yellow, instructions: "Piedi sull'elastico, solleva le braccia tese davanti a te.", motionPattern: .verticalPress, imageSystemName: "figure.strengthtraining.traditional"),
        Exercise(id: "lateral-raise", name: "Alzate Laterali", muscleGroups: [.shoulders], defaultBand: .yellow, instructions: "Piedi sull'elastico, solleva le braccia lateralmente.", motionPattern: .verticalPress, imageSystemName: "figure.strengthtraining.traditional"),

        Exercise(id: "kneel-crunch", name: "Crunch in Ginocchio", muscleGroups: [.core], defaultBand: .red, instructions: "In ginocchio, elastico ancorato in alto, piega il busto in avanti.", motionPattern: .verticalPress, imageSystemName: "figure.core.training"),
        Exercise(id: "crunch", name: "Crunch", muscleGroups: [.core], defaultBand: .yellow, instructions: "Sdraiato, elastico dietro la testa, esegui un crunch classico.", motionPattern: .verticalPress, imageSystemName: "figure.core.training"),
        Exercise(id: "reverse-crunch", name: "Crunch Inverso", muscleGroups: [.core], defaultBand: .yellow, instructions: "Sdraiato, porta le ginocchia verso il petto.", motionPattern: .verticalPress, imageSystemName: "figure.core.training"),
        Exercise(id: "sit-up", name: "Sit-Up", muscleGroups: [.core], defaultBand: .red, instructions: "Sdraiato, sali fino a seduto tenendo l'elastico.", motionPattern: .verticalPress, imageSystemName: "figure.core.training"),
        Exercise(id: "russian-twist", name: "Russian Twist", muscleGroups: [.core], defaultBand: .yellow, instructions: "Seduto, busto inclinato, ruota il tronco a destra e sinistra.", motionPattern: .rotational, imageSystemName: "figure.core.training"),
        Exercise(id: "woodchopper", name: "Woodchopper", muscleGroups: [.core], defaultBand: .red, instructions: "Elastico ancorato lateralmente, ruota il busto tirando in diagonale.", motionPattern: .rotational, imageSystemName: "figure.core.training"),
        Exercise(id: "bicycle-crunch", name: "Crunch Bicicletta", muscleGroups: [.core], defaultBand: .yellow, instructions: "Sdraiato, alterna gomito-ginocchio opposto pedalando.", motionPattern: .rotational, imageSystemName: "figure.core.training"),
        Exercise(id: "side-bend", name: "Flessioni Laterali", muscleGroups: [.core], defaultBand: .yellow, instructions: "In piedi, piega lateralmente il busto contro la resistenza.", motionPattern: .rotational, imageSystemName: "figure.core.training"),

        Exercise(id: "hip-abduction", name: "Abduzione Anca", muscleGroups: [.glutes], defaultBand: .yellow, instructions: "Elastico alle caviglie, allontana la gamba lateralmente.", motionPattern: .lateralPull, imageSystemName: "figure.walk"),
        Exercise(id: "hip-flexion", name: "Flessione Anca", muscleGroups: [.legs], defaultBand: .yellow, instructions: "Elastico alla caviglia, solleva il ginocchio in avanti.", motionPattern: .verticalPress, imageSystemName: "figure.walk"),
        Exercise(id: "std-kickback", name: "Kickback Glutei", muscleGroups: [.glutes], defaultBand: .red, instructions: "Elastico alla caviglia, spingi la gamba all'indietro.", motionPattern: .lateralPull, imageSystemName: "figure.walk"),
        Exercise(id: "lunge", name: "Affondi", muscleGroups: [.legs, .glutes], defaultBand: .red, instructions: "Elastico sotto il piede avanti, esegui un affondo.", motionPattern: .squatJump, imageSystemName: "figure.walk"),
        Exercise(id: "monster-walk", name: "Monster Walk", muscleGroups: [.glutes], defaultBand: .red, instructions: "Elastico alle caviglie, cammina lateralmente in semi-squat.", motionPattern: .lateralPull, imageSystemName: "figure.walk"),
        Exercise(id: "calf-ext", name: "Estensione Polpacci", muscleGroups: [.legs], defaultBand: .yellow, instructions: "Elastico sotto l'avampiede, solleva i talloni.", motionPattern: .verticalPress, imageSystemName: "figure.walk"),
    ]

    public static let byId: [String: Exercise] = Dictionary(uniqueKeysWithValues: all.map { ($0.id, $0) })
}

/// Predefined workout plans, ported from the original app's workouts.ts.
public enum PredefinedWorkouts {
    private static func entry(_ exerciseId: String, sets: Int, reps: Int, rest: Int) -> WorkoutExerciseEntry {
        let band = ExerciseLibrary.byId[exerciseId]?.defaultBand ?? .red
        return WorkoutExerciseEntry(exerciseId: exerciseId, band: band, sets: sets, reps: reps, restSeconds: rest)
    }

    public static let all: [WorkoutPlan] = [
        WorkoutPlan(name: "Corpo Libero", entries: [
            entry("thruster", sets: 3, reps: 12, rest: 60),
            entry("push-up", sets: 3, reps: 10, rest: 45),
            entry("lunge", sets: 3, reps: 12, rest: 45),
            entry("lat-pulldown", sets: 3, reps: 12, rest: 45),
            entry("russian-twist", sets: 3, reps: 20, rest: 30),
        ], isPredefined: true),

        WorkoutPlan(name: "Parte Superiore", entries: [
            entry("std-chest-press", sets: 3, reps: 12, rest: 45),
            entry("lat-pulldown", sets: 3, reps: 12, rest: 45),
            entry("shoulder-press", sets: 3, reps: 10, rest: 45),
            entry("bicep-curl", sets: 3, reps: 12, rest: 30),
            entry("tricep-pushdown", sets: 3, reps: 12, rest: 30),
            entry("lateral-raise", sets: 3, reps: 15, rest: 30),
        ], isPredefined: true),

        WorkoutPlan(name: "Core", entries: [
            entry("crunch", sets: 3, reps: 20, rest: 30),
            entry("russian-twist", sets: 3, reps: 20, rest: 30),
            entry("reverse-crunch", sets: 3, reps: 15, rest: 30),
            entry("woodchopper", sets: 3, reps: 12, rest: 30),
            entry("bicycle-crunch", sets: 3, reps: 20, rest: 30),
        ], isPredefined: true),

        WorkoutPlan(name: "Parte Inferiore", entries: [
            entry("lunge", sets: 3, reps: 12, rest: 45),
            entry("std-kickback", sets: 3, reps: 12, rest: 30),
            entry("hip-abduction", sets: 3, reps: 15, rest: 30),
            entry("monster-walk", sets: 3, reps: 20, rest: 30),
            entry("calf-ext", sets: 3, reps: 20, rest: 30),
        ], isPredefined: true),
    ]
}
