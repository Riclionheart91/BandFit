import type { Workout, WorkoutExercise } from "@/src/data/workouts";
import { EXERCISES, EXERCISES_BY_ID } from "@/src/data/exercises";
import type { Category } from "@/src/theme";
import { aiEngine } from "@/src/config";

export type DaySession = {
  week: number;
  dayIndex: number;
  split: Category;
  workout: Workout;
  isDeload: boolean;
  completed: boolean;
  rpe: number | null;
};

export type WeeklyProgram = {
  id: string;
  frequency: 2 | 3 | 4;
  createdAt: string;
  currentWeek: number;
  currentDay: number;
  days: DaySession[];
};

function pickExercises(split: Category, count: number, usedIds: Set<string>): WorkoutExercise[] {
  const pool = EXERCISES.filter(
    (e) => e.category === split || (split === "core" && e.movementType === "core")
  );
  const fresh = pool.filter((e) => !usedIds.has(e.id));
  const source = fresh.length >= count ? fresh : pool;
  const picked = source.slice(0, count);
  picked.forEach((e) => usedIds.add(e.id));
  return picked.map((e) => ({
    exerciseId: e.id,
    sets: 3,
    reps: 12,
    rest: aiEngine.rest.base,
  }));
}

function buildWorkout(split: Category, week: number, isDeload: boolean, usedIds: Set<string>): Workout {
  let exercises = pickExercises(split, aiEngine.exercisesPerSession, usedIds);

  if (exercises.length < aiEngine.exercisesPerSession) {
    const deficit = aiEngine.exercisesPerSession - exercises.length;
    const already = new Set(exercises.map((e) => e.exerciseId));
    const variants = exercises
      .filter((e) => !already.has(`${e.exerciseId}-iso`))
      .slice(0, deficit)
      .map((e) => ({ ...e, holdSeconds: aiEngine.isometricHoldDuration }));
    exercises = [...exercises, ...variants];
  }

  if (isDeload) {
    exercises = exercises.map((e) => ({
      ...e,
      sets: Math.max(1, Math.round(e.sets * (1 - aiEngine.deloadReductionFactor))),
      rest: aiEngine.rest.deload,
    }));
  }

  const label = { upper: "Parte Superiore", lower: "Parte Inferiore", core: "Core", full_body: "Corpo Libero" }[split];

  return {
    id: `ai-${split}-w${week}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `Settimana ${week} · ${label}`,
    category: split,
    description: isDeload
      ? "Settimana di scarico: volume ridotto, recuperi più lunghi"
      : `Sessione generata dal piano IA (settimana ${week})`,
    exercises,
  };
}

export function generateWeeklyProgram(frequency: 2 | 3 | 4): WeeklyProgram {
  const splitOrder = aiEngine.frequencyToSplit[frequency] as Category[];
  const days: DaySession[] = [];
  const usedIds = new Set<string>();

  for (let week = 1; week <= aiEngine.programLength; week++) {
    const isDeload = week === aiEngine.deloadWeek;
    const isReset = week === aiEngine.resetWeek;
    const order = isReset ? [...splitOrder].reverse() : splitOrder;
    if (isReset) usedIds.clear();

    order.forEach((split, dayIndex) => {
      days.push({
        week,
        dayIndex,
        split,
        workout: buildWorkout(split, week, isDeload, usedIds),
        isDeload,
        completed: false,
        rpe: null,
      });
    });
  }

  return {
    id: `prog-${Date.now()}`,
    frequency,
    createdAt: new Date().toISOString(),
    currentWeek: 1,
    currentDay: 0,
    days,
  };
}

export function applyRpeAdaptation(
  program: WeeklyProgram,
  completedWorkoutId: string,
  rpe: number
): WeeklyProgram {
  const idx = program.days.findIndex((d) => d.workout.id === completedWorkoutId && !d.completed);
  if (idx < 0) return program;
  const day = program.days[idx];
  day.completed = true;
  day.rpe = rpe;

  const nextSameSplit = program.days
    .slice(idx + 1)
    .find((d) => d.split === day.split && d.week < aiEngine.deloadWeek);

  if (nextSameSplit && rpe < aiEngine.rpeThreshold) {
    nextSameSplit.workout.exercises = nextSameSplit.workout.exercises.map((e) => {
      if (!EXERCISES_BY_ID[e.exerciseId]) return e;
      const reps = Math.round(e.reps * (1 + aiEngine.volumeIncreaseFactor));
      const rest = Math.max(15, Math.round(e.rest * (1 - aiEngine.volumeIncreaseFactor)));
      return { ...e, reps, rest };
    });
  }

  const totalPerWeek = (aiEngine.frequencyToSplit[program.frequency] ?? []).length;
  program.currentDay += 1;
  if (program.currentDay >= totalPerWeek) {
    program.currentDay = 0;
    program.currentWeek = program.currentWeek >= aiEngine.programLength ? 1 : program.currentWeek + 1;
  }

  return { ...program };
}

export function todaysSession(program: WeeklyProgram | null): DaySession | null {
  if (!program) return null;
  return (
    program.days.find((d) => d.week === program.currentWeek && d.dayIndex === program.currentDay) ?? null
  );
}
