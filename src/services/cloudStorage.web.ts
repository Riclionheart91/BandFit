import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { supabase as supabaseCfg, legal } from "@/src/config";
import type { Session } from "@/src/services/storage";
import type { Workout } from "@/src/data/workouts";
import type { WeeklyProgram } from "@/src/services/periodization";
import type { PersonalProfile } from "@/src/services/userSettings";

let client: SupabaseClient | null = null;

export function getClient(): SupabaseClient {
  if (!client) client = createClient(supabaseCfg.url, supabaseCfg.anonKey);
  return client;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabaseCfg.url || !supabaseCfg.anonKey) return null;
  const { data } = await getClient().auth.getUser();
  return data.user ?? null;
}

export async function signInWithGoogle(): Promise<void> {
  await getClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: supabaseCfg.authRedirectUrl },
  });
}

export async function signOut(): Promise<void> {
  await getClient().auth.signOut();
}

export async function syncSessionsToCloud(userId: string, sessions: Session[]): Promise<void> {
  if (!sessions.length) return;
  const rows = sessions.map((s) => ({ ...s, user_id: userId }));
  await getClient().from(supabaseCfg.tables.sessions).upsert(rows, { onConflict: "id" });
}

export async function syncCustomWorkoutsToCloud(userId: string, workouts: Workout[]): Promise<void> {
  if (!workouts.length) return;
  const rows = workouts.map((w) => ({ ...w, user_id: userId }));
  await getClient().from(supabaseCfg.tables.customWorkouts).upsert(rows, { onConflict: "id" });
}

export async function syncWeeklyProgramToCloud(userId: string, program: WeeklyProgram): Promise<void> {
  await getClient()
    .from(supabaseCfg.tables.weeklyPrograms)
    .upsert({ ...program, user_id: userId }, { onConflict: "id" });
}

export async function syncPersonalProfileToCloud(userId: string, profile: PersonalProfile): Promise<void> {
  await getClient()
    .from(supabaseCfg.tables.personalProfiles)
    .upsert(
      {
        user_id: userId,
        name: profile.name,
        age: profile.age,
        weight_kg: profile.weightKg,
        height_cm: profile.heightCm,
        goal: profile.goal,
        level: profile.level,
      },
      { onConflict: "user_id" }
    );
}

export async function pullPersonalProfile(userId: string): Promise<PersonalProfile | null> {
  const { data } = await getClient()
    .from(supabaseCfg.tables.personalProfiles)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    name: data.name ?? "",
    age: data.age ?? null,
    weightKg: data.weight_kg ?? null,
    heightCm: data.height_cm ?? null,
    goal: data.goal ?? null,
    level: data.level ?? null,
  };
}

export async function pullCloudData(userId: string) {
  const c = getClient();
  const [sessions, workouts, programs] = await Promise.all([
    c.from(supabaseCfg.tables.sessions).select("*").eq("user_id", userId),
    c.from(supabaseCfg.tables.customWorkouts).select("*").eq("user_id", userId),
    c.from(supabaseCfg.tables.weeklyPrograms).select("*").eq("user_id", userId),
  ]);
  return {
    sessions: (sessions.data ?? []) as Session[],
    customWorkouts: (workouts.data ?? []) as Workout[],
    weeklyProgram: (programs.data?.[0] ?? null) as WeeklyProgram | null,
  };
}
