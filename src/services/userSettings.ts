import type { BandColor } from "@/src/theme";
import { aiEngine } from "@/src/config";

export type UserSettings = {
  audioCoachEnabled: boolean;
  hapticsEnabled: boolean;
  ownedBands: BandColor[];
  defaultRestSeconds: number;
  aiExercisesPerSession: number;
};

export const DEFAULT_SETTINGS: UserSettings = {
  audioCoachEnabled: true,
  hapticsEnabled: true,
  ownedBands: ["yellow", "red", "black", "purple"],
  defaultRestSeconds: aiEngine.rest.base,
  aiExercisesPerSession: aiEngine.exercisesPerSession,
};

export type FitnessGoal = "fatloss" | "tone" | "strength" | "endurance";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export type PersonalProfile = {
  name: string;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  goal: FitnessGoal | null;
  level: FitnessLevel | null;
};

export const DEFAULT_PERSONAL_PROFILE: PersonalProfile = {
  name: "",
  age: null,
  weightKg: null,
  heightCm: null,
  goal: null,
  level: null,
};
