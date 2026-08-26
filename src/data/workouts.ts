import type { Category } from "@/src/theme";

export type WorkoutExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  rest: number; // seconds
  holdSeconds?: number; // isometric variant, used by the AI periodization engine
};

export type Workout = {
  id: string;
  name: string;
  category: Category;
  description: string;
  exercises: WorkoutExercise[];
};

// 4 predefined workouts using the exercise library
export const PREDEFINED_WORKOUTS: Workout[] = [
  {
    id: "wk-full-body",
    name: "Corpo Libero",
    category: "full_body",
    description: "Allenamento completo per tutto il corpo",
    exercises: [
      { exerciseId: "thruster", sets: 3, reps: 12, rest: 60 },
      { exerciseId: "push-up", sets: 3, reps: 10, rest: 45 },
      { exerciseId: "lunge", sets: 3, reps: 12, rest: 45 },
      { exerciseId: "lat-pulldown", sets: 3, reps: 12, rest: 45 },
      { exerciseId: "russian-twist", sets: 3, reps: 20, rest: 30 },
    ],
  },
  {
    id: "wk-upper",
    name: "Parte Superiore",
    category: "upper",
    description: "Petto, schiena, spalle e braccia",
    exercises: [
      { exerciseId: "std-chest-press", sets: 3, reps: 12, rest: 45 },
      { exerciseId: "lat-pulldown", sets: 3, reps: 12, rest: 45 },
      { exerciseId: "shoulder-press", sets: 3, reps: 10, rest: 45 },
      { exerciseId: "bicep-curl", sets: 3, reps: 12, rest: 30 },
      { exerciseId: "tricep-pushdown", sets: 3, reps: 12, rest: 30 },
      { exerciseId: "lateral-raise", sets: 3, reps: 15, rest: 30 },
    ],
  },
  {
    id: "wk-core",
    name: "Core",
    category: "core",
    description: "Allenamento per addominali e core",
    exercises: [
      { exerciseId: "crunch", sets: 3, reps: 20, rest: 30 },
      { exerciseId: "russian-twist", sets: 3, reps: 20, rest: 30 },
      { exerciseId: "reverse-crunch", sets: 3, reps: 15, rest: 30 },
      { exerciseId: "woodchopper", sets: 3, reps: 12, rest: 30 },
      { exerciseId: "bicycle-crunch", sets: 3, reps: 20, rest: 30 },
    ],
  },
  {
    id: "wk-lower",
    name: "Parte Inferiore",
    category: "lower",
    description: "Gambe, glutei e polpacci",
    exercises: [
      { exerciseId: "lunge", sets: 3, reps: 12, rest: 45 },
      { exerciseId: "std-kickback", sets: 3, reps: 12, rest: 30 },
      { exerciseId: "hip-abduction", sets: 3, reps: 15, rest: 30 },
      { exerciseId: "monster-walk", sets: 3, reps: 20, rest: 30 },
      { exerciseId: "calf-ext", sets: 3, reps: 20, rest: 30 },
    ],
  },
];
