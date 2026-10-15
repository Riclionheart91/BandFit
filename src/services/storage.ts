import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Workout } from "@/src/data/workouts";
import type { BandColor } from "@/src/theme";

const KEYS = {
  customWorkouts: "@rb/custom_workouts",
  sessions: "@rb/sessions",
};

/** Una serie realmente eseguita (a differenza di `sets`/`reps`, che sono i valori pianificati). */
export type SetLog = {
  setIndex: number; // 0-based
  targetReps: number; // ripetizioni previste dal piano
  reps: number; // ripetizioni fatte
  band: BandColor; // banda usata
  holdSeconds?: number; // solo per le varianti isometriche
};

export type SessionExerciseLog = {
  exerciseId: string;
  name: string;
  sets: number; // serie pianificate
  reps: number; // ripetizioni pianificate per serie
  setLogs?: SetLog[]; // assente nelle sessioni salvate prima di questa versione
};

export type Session = {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string; // ISO
  duration: number; // seconds
  heartRates: number[];
  calories: number;
  rpe?: number | null; // sforzo percepito 1-10, se indicato a fine allenamento
  exercises?: SessionExerciseLog[];
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// Custom workouts
export const getCustomWorkouts = (): Promise<Workout[]> =>
  readJSON<Workout[]>(KEYS.customWorkouts, []);

export async function saveCustomWorkout(w: Workout): Promise<Workout[]> {
  const list = await getCustomWorkouts();
  const next = [...list.filter((x) => x.id !== w.id), w];
  await writeJSON(KEYS.customWorkouts, next);
  return next;
}

export async function deleteCustomWorkout(id: string): Promise<Workout[]> {
  const list = await getCustomWorkouts();
  const next = list.filter((x) => x.id !== id);
  await writeJSON(KEYS.customWorkouts, next);
  return next;
}

// Sessions
export const getSessions = (): Promise<Session[]> =>
  readJSON<Session[]>(KEYS.sessions, []);

export async function saveSession(s: Session): Promise<Session[]> {
  const list = await getSessions();
  const next = [s, ...list].slice(0, 200);
  await writeJSON(KEYS.sessions, next);
  return next;
}

export async function deleteSession(id: string): Promise<Session[]> {
  const list = await getSessions();
  const next = list.filter((s) => s.id !== id);
  await writeJSON(KEYS.sessions, next);
  return next;
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.customWorkouts, KEYS.sessions]);
}
