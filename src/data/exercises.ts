import type { BandColor, Category } from "@/src/theme";

export type MovementType = "push" | "pull" | "core" | "stability";
export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Exercise = {
  id: string;
  name: string;
  nameEn: string;
  category: Category;
  band: BandColor;
  targetMuscles: string[];
  movementType: MovementType;
  level: Level;
  icon: string; // Ionicons name
};

// User-provided list translated to Italian, band assigned by movement+level
export const EXERCISES: Exercise[] = [
  // Full Body
  { id: "thruster", nameEn: "Thruster", name: "Thruster", category: "full_body", band: "black", targetMuscles: ["Gambe", "Spalle", "Glutei"], movementType: "push", level: "Intermediate", icon: "body" },

  // Upper Body
  { id: "std-chest-press", nameEn: "Standing Chest Press", name: "Distensioni Petto in Piedi", category: "upper", band: "red", targetMuscles: ["Petto", "Tricipiti", "Spalle"], movementType: "push", level: "Beginner", icon: "barbell" },
  { id: "chest-fly", nameEn: "Chest Fly", name: "Croci Petto", category: "upper", band: "red", targetMuscles: ["Petto"], movementType: "push", level: "Beginner", icon: "barbell" },
  { id: "push-up", nameEn: "Push-Up", name: "Piegamenti", category: "upper", band: "black", targetMuscles: ["Petto", "Tricipiti", "Core"], movementType: "push", level: "Intermediate", icon: "barbell" },
  { id: "bicep-curl", nameEn: "Biceps Curl", name: "Curl Bicipiti", category: "upper", band: "red", targetMuscles: ["Bicipiti"], movementType: "pull", level: "Beginner", icon: "barbell" },
  { id: "tricep-pushdown", nameEn: "Triceps Pushdown", name: "Push-down Tricipiti", category: "upper", band: "yellow", targetMuscles: ["Tricipiti"], movementType: "push", level: "Beginner", icon: "barbell" },
  { id: "tricep-kickback", nameEn: "Triceps Kickback", name: "Kickback Tricipiti", category: "upper", band: "yellow", targetMuscles: ["Tricipiti"], movementType: "push", level: "Beginner", icon: "barbell" },
  { id: "overhead-tricep", nameEn: "Overhead Triceps Extension", name: "Estensioni Tricipiti", category: "upper", band: "yellow", targetMuscles: ["Tricipiti"], movementType: "push", level: "Beginner", icon: "barbell" },
  { id: "single-lat-pulldown", nameEn: "Single Arm Lat Pulldown", name: "Lat Pulldown Singolo", category: "upper", band: "red", targetMuscles: ["Dorsali"], movementType: "pull", level: "Beginner", icon: "barbell" },
  { id: "lat-pulldown", nameEn: "Lat Pulldown", name: "Lat Pulldown", category: "upper", band: "black", targetMuscles: ["Dorsali"], movementType: "pull", level: "Beginner", icon: "barbell" },
  { id: "upright-row", nameEn: "Upright Row", name: "Rematore Verticale", category: "upper", band: "black", targetMuscles: ["Spalle", "Trapezi"], movementType: "pull", level: "Intermediate", icon: "barbell" },
  { id: "face-pull", nameEn: "Face Pull", name: "Face Pull", category: "upper", band: "red", targetMuscles: ["Deltoidi Posteriori", "Schiena Alta"], movementType: "pull", level: "Beginner", icon: "barbell" },
  { id: "shoulder-press", nameEn: "Shoulder Press", name: "Lento Spalle", category: "upper", band: "red", targetMuscles: ["Spalle", "Tricipiti"], movementType: "push", level: "Beginner", icon: "barbell" },
  { id: "ext-rotation", nameEn: "Shoulder External Rotation", name: "Rotazione Esterna Spalle", category: "upper", band: "yellow", targetMuscles: ["Cuffia dei Rotatori"], movementType: "stability", level: "Beginner", icon: "barbell" },
  { id: "front-raise", nameEn: "Front Raise", name: "Alzate Frontali", category: "upper", band: "yellow", targetMuscles: ["Spalle"], movementType: "push", level: "Beginner", icon: "barbell" },
  { id: "lateral-raise", nameEn: "Lateral Raise", name: "Alzate Laterali", category: "upper", band: "yellow", targetMuscles: ["Spalle"], movementType: "push", level: "Beginner", icon: "barbell" },

  // Core
  { id: "kneel-crunch", nameEn: "Kneeling Crunch", name: "Crunch in Ginocchio", category: "core", band: "red", targetMuscles: ["Addome"], movementType: "core", level: "Beginner", icon: "flame" },
  { id: "crunch", nameEn: "Crunch", name: "Crunch", category: "core", band: "yellow", targetMuscles: ["Addome"], movementType: "core", level: "Beginner", icon: "flame" },
  { id: "reverse-crunch", nameEn: "Reverse Crunch", name: "Crunch Inverso", category: "core", band: "yellow", targetMuscles: ["Addome Basso"], movementType: "core", level: "Beginner", icon: "flame" },
  { id: "sit-up", nameEn: "Sit-Up", name: "Sit-Up", category: "core", band: "red", targetMuscles: ["Addome", "Flessori Anca"], movementType: "core", level: "Intermediate", icon: "flame" },
  { id: "russian-twist", nameEn: "Russian Twist", name: "Russian Twist", category: "core", band: "yellow", targetMuscles: ["Obliqui"], movementType: "core", level: "Beginner", icon: "flame" },
  { id: "woodchopper", nameEn: "Woodchopper", name: "Woodchopper", category: "core", band: "red", targetMuscles: ["Obliqui", "Core"], movementType: "core", level: "Intermediate", icon: "flame" },
  { id: "bicycle-crunch", nameEn: "Bicycle Crunch", name: "Crunch Bicicletta", category: "core", band: "yellow", targetMuscles: ["Addome", "Obliqui"], movementType: "core", level: "Intermediate", icon: "flame" },
  { id: "side-bend", nameEn: "Side Bend", name: "Flessioni Laterali", category: "core", band: "yellow", targetMuscles: ["Obliqui"], movementType: "core", level: "Beginner", icon: "flame" },

  // Lower Body
  { id: "hip-abduction", nameEn: "Hip Abduction", name: "Abduzione Anca", category: "lower", band: "yellow", targetMuscles: ["Glutei"], movementType: "push", level: "Beginner", icon: "walk" },
  { id: "hip-flexion", nameEn: "Hip Flexion", name: "Flessione Anca", category: "lower", band: "yellow", targetMuscles: ["Flessori Anca"], movementType: "pull", level: "Beginner", icon: "walk" },
  { id: "std-kickback", nameEn: "Standing Kickback", name: "Kickback Glutei", category: "lower", band: "red", targetMuscles: ["Glutei"], movementType: "push", level: "Beginner", icon: "walk" },
  { id: "lunge", nameEn: "Lunge", name: "Affondi", category: "lower", band: "red", targetMuscles: ["Gambe", "Glutei"], movementType: "push", level: "Beginner", icon: "walk" },
  { id: "monster-walk", nameEn: "Monster Walk", name: "Monster Walk", category: "lower", band: "red", targetMuscles: ["Glutei"], movementType: "stability", level: "Beginner", icon: "walk" },
  { id: "calf-ext", nameEn: "Calf Extension", name: "Estensione Polpacci", category: "lower", band: "yellow", targetMuscles: ["Polpacci"], movementType: "push", level: "Beginner", icon: "walk" },
];

export const EXERCISES_BY_ID: Record<string, Exercise> = EXERCISES.reduce(
  (acc, e) => ({ ...acc, [e.id]: e }),
  {}
);
