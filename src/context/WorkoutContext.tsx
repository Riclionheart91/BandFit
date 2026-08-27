import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import {
  WorkoutEngine,
  type EngineSnapshot,
} from "@/src/services/workoutEngine";
import type { Workout } from "@/src/data/workouts";
import {
  startWorkout as healthStart,
  stopWorkout as healthStop,
  subscribeHeartRate,
} from "@/src/services/health";
import {
  getSessions,
  saveSession,
  deleteSession,
  getCustomWorkouts,
  saveCustomWorkout,
  deleteCustomWorkout,
  type Session,
} from "@/src/services/storage";
import { logWorkoutToCalendar } from "@/src/services/calendar";
import { EXERCISES_BY_ID } from "@/src/data/exercises";
import { audioCoach, legal } from "@/src/config";
import {
  generateWeeklyProgram,
  applyRpeAdaptation,
  type WeeklyProgram,
} from "@/src/services/periodization";
import {
  getCurrentUser,
  signInWithGoogle as cloudSignInWithGoogle,
  signOut as cloudSignOut,
  syncSessionsToCloud,
  syncCustomWorkoutsToCloud,
  syncWeeklyProgramToCloud,
} from "@/src/services/cloudStorage";

type Ctx = {
  // engine
  activeWorkout: Workout | null;
  snapshot: EngineSnapshot | null;
  startWorkout: (w: Workout) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  completeSet: () => void;
  skipExercise: () => void;
  endWorkout: (rpe?: number) => Promise<void>;
  cancelWorkout: () => void;
  // hr
  bpm: number | null;
  // sessions & customs
  sessions: Session[];
  customWorkouts: Workout[];
  addCustomWorkout: (w: Workout) => Promise<void>;
  removeCustomWorkout: (id: string) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  refresh: () => Promise<void>;

  // web additions
  disclaimerAccepted: boolean;
  acceptDisclaimer: () => Promise<void>;
  batterySaver: boolean;
  setBatterySaver: (v: boolean) => Promise<void>;
  weeklyProgram: WeeklyProgram | null;
  generateProgram: (frequency: 2 | 3 | 4) => Promise<void>;
  isCloudMode: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const WorkoutContext = createContext<Ctx | null>(null);

function speak(text: string) {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  const synth = (window as any).speechSynthesis;
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = audioCoach.lang;
  u.rate = audioCoach.rate;
  u.pitch = audioCoach.pitch;
  synth.speak(u);
}

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null);
  const [bpm, setBpm] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [customWorkouts, setCustomWorkouts] = useState<Workout[]>([]);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true);
  const [batterySaver, setBatterySaverState] = useState(false);
  const [weeklyProgram, setWeeklyProgram] = useState<WeeklyProgram | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false);

  const engineRef = useRef<WorkoutEngine | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hrCollected = useRef<number[]>([]);
  const lastTickAt = useRef<number>(0);
  const lastExerciseIndex = useRef<number>(-1);
  const lastEngineState = useRef<string>("idle");

  const refresh = useCallback(async () => {
    const [s, c] = await Promise.all([getSessions(), getCustomWorkouts()]);
    setSessions(s);
    setCustomWorkouts(c);
  }, []);

  useEffect(() => {
    refresh();
    AsyncStorage.getItem(legal.storageKeys.disclaimerAccepted).then((v) =>
      setDisclaimerAccepted(v === "true")
    );
    AsyncStorage.getItem(legal.storageKeys.batterySaver).then((v) =>
      setBatterySaverState(v === "true")
    );
    AsyncStorage.getItem(legal.storageKeys.weeklyProgram).then((v) => {
      if (v) {
        try {
          setWeeklyProgram(JSON.parse(v));
        } catch {}
      }
    });
    getCurrentUser()
      .then((u: Awaited<ReturnType<typeof getCurrentUser>>) => setIsCloudMode(!!u))
      .catch(() => {});
  }, [refresh]);

  const acceptDisclaimer = useCallback(async () => {
    await AsyncStorage.setItem(legal.storageKeys.disclaimerAccepted, "true");
    setDisclaimerAccepted(true);
  }, []);

  const setBatterySaver = useCallback(async (v: boolean) => {
    await AsyncStorage.setItem(legal.storageKeys.batterySaver, String(v));
    setBatterySaverState(v);
  }, []);

  const persistProgram = useCallback(async (p: WeeklyProgram) => {
    setWeeklyProgram({ ...p });
    await AsyncStorage.setItem(legal.storageKeys.weeklyProgram, JSON.stringify(p));
  }, []);

  const generateProgram = useCallback(
    async (frequency: 2 | 3 | 4) => {
      const p = generateWeeklyProgram(frequency);
      await persistProgram(p);
    },
    [persistProgram]
  );

  // Auto-pause when backgrounded (native + web tab hidden)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active" && engineRef.current) {
        engineRef.current.pause();
      }
    });
    return () => sub.remove();
  }, []);

  // Anti-freeze: recompute elapsed time via Date.now() when the web tab returns to foreground
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const onVis = () => {
      if (document.visibilityState === "visible" && lastTickAt.current) {
        const driftSeconds = Math.floor((Date.now() - lastTickAt.current) / 1000);
        for (let i = 0; i < driftSeconds; i++) engineRef.current?.tick();
      }
      lastTickAt.current = Date.now();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const stopTicker = useCallback(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  const startTicker = useCallback(() => {
    if (tickerRef.current) return;
    lastTickAt.current = Date.now();
    tickerRef.current = setInterval(() => {
      lastTickAt.current = Date.now();
      engineRef.current?.tick();
    }, 1000);
  }, []);

  const handleSnapshot = useCallback((s: EngineSnapshot) => {
    setSnapshot(s);

    if (s.exerciseIndex !== lastExerciseIndex.current && s.currentExercise) {
      lastExerciseIndex.current = s.exerciseIndex;
      const ex = EXERCISES_BY_ID[s.currentExercise.exerciseId];
      if (ex) speak(audioCoach.phrases.exerciseChange(ex.name));
    }

    if (s.state !== lastEngineState.current) {
      if (s.state === "active" && lastEngineState.current === "rest") {
        speak(audioCoach.phrases.restEnd);
      } else if (s.state === "active") {
        speak(audioCoach.phrases.setStart);
      } else if (s.state === "rest") {
        speak(audioCoach.phrases.restStart);
      } else if (s.state === "done") {
        speak(audioCoach.phrases.workoutDone);
      }
      lastEngineState.current = s.state;
    }
  }, []);

  const startWorkout = useCallback(
    (w: Workout) => {
      hrCollected.current = [];
      lastExerciseIndex.current = -1;
      lastEngineState.current = "idle";
      const engine = new WorkoutEngine(w, {
        onSnapshot: handleSnapshot,
        onSetComplete: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onWorkoutDone: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          stopTicker();
        },
      });
      engineRef.current = engine;
      setActiveWorkout(w);
      engine.start();
      startTicker();
      healthStart();
      speak(audioCoach.phrases.workoutStart);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [startTicker, stopTicker, handleSnapshot]
  );

  const pauseWorkout = useCallback(() => {
    engineRef.current?.pause();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const resumeWorkout = useCallback(() => {
    engineRef.current?.start();
  }, []);

  const completeSet = useCallback(() => {
    engineRef.current?.completeSet();
  }, []);

  const skipExercise = useCallback(() => {
    engineRef.current?.skipExercise();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const cancelWorkout = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.end();
    stopTicker();
    healthStop();
    setActiveWorkout(null);
    setSnapshot(null);
    engineRef.current = null;
  }, [stopTicker]);

  const endWorkout = useCallback(
    async (rpe?: number) => {
      if (!activeWorkout || !engineRef.current) return;
      const snap = engineRef.current.snapshot();
      engineRef.current.end();
      stopTicker();
      healthStop();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const now = new Date();
      const start = new Date(now.getTime() - snap.elapsed * 1000);
      const calories = Math.max(1, Math.round((snap.elapsed / 60) * 6));
      const session: Session = {
        id: `s-${Date.now()}`,
        workoutId: activeWorkout.id,
        workoutName: activeWorkout.name,
        date: now.toISOString(),
        duration: snap.elapsed,
        heartRates: [...hrCollected.current],
        calories,
        exercises: activeWorkout.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          name: EXERCISES_BY_ID[e.exerciseId]?.name ?? e.exerciseId,
          sets: e.sets,
          reps: e.reps,
        })),
      };
      await saveSession(session);

      logWorkoutToCalendar({
        title: `Allenamento: ${activeWorkout.name}`,
        startDate: start,
        endDate: now,
        exercises: activeWorkout.exercises.map(
          (e) => EXERCISES_BY_ID[e.exerciseId]?.name ?? e.exerciseId
        ),
      });

      if (weeklyProgram && typeof rpe === "number") {
        const updated = applyRpeAdaptation(weeklyProgram, activeWorkout.id, rpe);
        await persistProgram(updated);
        const u = await getCurrentUser().catch(() => null);
        if (u) syncWeeklyProgramToCloud(u.id, updated).catch(() => {});
      }

      await refresh();
      const u = await getCurrentUser().catch(() => null);
      if (u) syncSessionsToCloud(u.id, [session]).catch(() => {});

      setActiveWorkout(null);
      setSnapshot(null);
      engineRef.current = null;
    },
    [activeWorkout, refresh, stopTicker, weeklyProgram, persistProgram]
  );

  // Subscribe to BPM
  useEffect(() => {
    const unsub = subscribeHeartRate((v) => {
      setBpm(v);
      if (v !== null && activeWorkout) hrCollected.current.push(v);
    });
    return unsub;
  }, [activeWorkout]);

  const addCustomWorkout = useCallback(async (w: Workout) => {
    const next = await saveCustomWorkout(w);
    setCustomWorkouts(next);
    const u = await getCurrentUser().catch(() => null);
    if (u) syncCustomWorkoutsToCloud(u.id, [w]).catch(() => {});
  }, []);

  const removeCustomWorkout = useCallback(async (id: string) => {
    const next = await deleteCustomWorkout(id);
    setCustomWorkouts(next);
  }, []);

  const removeSession = useCallback(async (id: string) => {
    const next = await deleteSession(id);
    setSessions(next);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await cloudSignInWithGoogle();
    setIsCloudMode(true);
  }, []);

  const logout = useCallback(async () => {
    await cloudSignOut();
    setIsCloudMode(false);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      activeWorkout,
      snapshot,
      startWorkout,
      pauseWorkout,
      resumeWorkout,
      completeSet,
      skipExercise,
      endWorkout,
      cancelWorkout,
      bpm,
      sessions,
      customWorkouts,
      addCustomWorkout,
      removeCustomWorkout,
      removeSession,
      refresh,
      disclaimerAccepted,
      acceptDisclaimer,
      batterySaver,
      setBatterySaver,
      weeklyProgram,
      generateProgram,
      isCloudMode,
      loginWithGoogle,
      logout,
    }),
    [
      activeWorkout,
      snapshot,
      startWorkout,
      pauseWorkout,
      resumeWorkout,
      completeSet,
      skipExercise,
      endWorkout,
      cancelWorkout,
      bpm,
      sessions,
      customWorkouts,
      addCustomWorkout,
      removeCustomWorkout,
      removeSession,
      refresh,
      disclaimerAccepted,
      acceptDisclaimer,
      batterySaver,
      setBatterySaver,
      weeklyProgram,
      generateProgram,
      isCloudMode,
      loginWithGoogle,
      logout,
    ]
  );

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
}

export function useWorkout(): Ctx {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used inside WorkoutProvider");
  return ctx;
}
