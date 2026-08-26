export function isHealthAvailable(): boolean {
  return false;
}

export async function startWorkout(): Promise<void> {}
export async function stopWorkout(): Promise<void> {}

export function subscribeHeartRate(_cb: (bpm: number | null) => void): () => void {
  return () => {};
}
