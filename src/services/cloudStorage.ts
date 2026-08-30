import type { User, SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@/src/services/storage";
import type { Workout } from "@/src/data/workouts";
import type { WeeklyProgram } from "@/src/services/periodization";

// Cloud sync is a web-exclusive feature (Metro picks cloudStorage.web.ts on web).
// This native no-op keeps the module resolvable for iOS/Android builds and for tsc.

export function getClient(): SupabaseClient {
  throw new Error("Supabase client is only available on web in this build");
}

export async function getCurrentUser(): Promise<User | null> {
  return null;
}

export async function signInWithGoogle(): Promise<void> {}

export async function signOut(): Promise<void> {}

export async function syncSessionsToCloud(_userId: string, _sessions: Session[]): Promise<void> {}

export async function syncCustomWorkoutsToCloud(_userId: string, _workouts: Workout[]): Promise<void> {}

export async function syncWeeklyProgramToCloud(_userId: string, _program: WeeklyProgram): Promise<void> {}

export async function pullCloudData(_userId: string) {
  return { sessions: [] as Session[], customWorkouts: [] as Workout[], weeklyProgram: null as WeeklyProgram | null };
}
