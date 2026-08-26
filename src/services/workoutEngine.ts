import type { Workout, WorkoutExercise } from "@/src/data/workouts";

export type EngineState = "idle" | "active" | "paused" | "rest" | "done";

export type EngineSnapshot = {
  state: EngineState;
  exerciseIndex: number;
  setIndex: number; // 0-based current set
  elapsed: number; // total elapsed seconds since start (excluding paused time)
  restRemaining: number; // when in rest
  currentExercise: WorkoutExercise | null;
  nextExercise: WorkoutExercise | null;
};

export type EngineEvents = {
  onSnapshot?: (s: EngineSnapshot) => void;
  onSetComplete?: (exerciseIndex: number, setIndex: number) => void;
  onExerciseComplete?: (exerciseIndex: number) => void;
  onWorkoutDone?: (totalElapsed: number) => void;
};

/**
 * Pure state machine for resistance band workouts.
 * Tick is driven externally (every 1s) via tick().
 */
export class WorkoutEngine {
  private workout: Workout;
  private events: EngineEvents;
  private state: EngineState = "idle";
  private exerciseIndex = 0;
  private setIndex = 0;
  private elapsed = 0;
  private restRemaining = 0;

  constructor(workout: Workout, events: EngineEvents = {}) {
    this.workout = workout;
    this.events = events;
  }

  start() {
    if (this.state === "idle") {
      this.state = "active";
      this.emit();
    } else if (this.state === "paused") {
      this.state = this.restRemaining > 0 ? "rest" : "active";
      this.emit();
    }
  }

  pause() {
    if (this.state === "active" || this.state === "rest") {
      this.state = "paused";
      this.emit();
    }
  }

  /** Mark current set as complete, advance to rest or next exercise. */
  completeSet() {
    if (this.state !== "active") return;
    const ex = this.workout.exercises[this.exerciseIndex];
    if (!ex) return;
    this.events.onSetComplete?.(this.exerciseIndex, this.setIndex);

    if (this.setIndex + 1 < ex.sets) {
      this.setIndex += 1;
      this.restRemaining = ex.rest;
      this.state = "rest";
    } else {
      this.events.onExerciseComplete?.(this.exerciseIndex);
      if (this.exerciseIndex + 1 < this.workout.exercises.length) {
        this.exerciseIndex += 1;
        this.setIndex = 0;
        this.restRemaining = ex.rest;
        this.state = "rest";
      } else {
        this.state = "done";
        this.events.onWorkoutDone?.(this.elapsed);
      }
    }
    this.emit();
  }

  /** Skip current exercise entirely. */
  skipExercise() {
    if (this.state === "idle" || this.state === "done") return;
    this.events.onExerciseComplete?.(this.exerciseIndex);
    if (this.exerciseIndex + 1 < this.workout.exercises.length) {
      this.exerciseIndex += 1;
      this.setIndex = 0;
      this.restRemaining = 0;
      this.state = "active";
    } else {
      this.state = "done";
      this.events.onWorkoutDone?.(this.elapsed);
    }
    this.emit();
  }

  end() {
    if (this.state !== "done") {
      this.state = "done";
      this.events.onWorkoutDone?.(this.elapsed);
    }
    this.emit();
  }

  /** Externally driven 1-second tick. */
  tick() {
    if (this.state === "active") {
      this.elapsed += 1;
    } else if (this.state === "rest") {
      this.elapsed += 1;
      this.restRemaining = Math.max(0, this.restRemaining - 1);
      if (this.restRemaining === 0) {
        this.state = "active";
      }
    }
    this.emit();
  }

  snapshot(): EngineSnapshot {
    const ex = this.workout.exercises;
    return {
      state: this.state,
      exerciseIndex: this.exerciseIndex,
      setIndex: this.setIndex,
      elapsed: this.elapsed,
      restRemaining: this.restRemaining,
      currentExercise: ex[this.exerciseIndex] ?? null,
      nextExercise: ex[this.exerciseIndex + 1] ?? null,
    };
  }

  private emit() {
    this.events.onSnapshot?.(this.snapshot());
  }
}
