import { NativeEventEmitter, NativeModules, Platform } from "react-native";

/**
 * HealthKit JS layer.
 *
 * Native bridge contract (HealthKitBridge.h/.m, iOS only):
 *   - startWorkout()      → starts HKWorkoutSession (strengthTraining)
 *   - stopWorkout()       → ends session, saves to Apple Fitness
 *   - subscribeHeartRate()→ begins HKLiveWorkoutBuilder HR streaming
 *   - unsubscribeHeartRate()
 *
 * Rep counting (stub – algorithm only):
 *   Threshold-based accelerometer logic
 *   1. Read user-acceleration (gravity removed) via Core Motion at 50Hz.
 *   2. Compute magnitude |a| = sqrt(x² + y² + z²) per sample.
 *   3. Low-pass filter (EMA, α=0.2) to remove jitter.
 *   4. Detect peaks: a sample is a peak if magnitude crosses
 *      UPPER_THRESHOLD (e.g. 1.4 g) going up, then crosses
 *      LOWER_THRESHOLD (e.g. 0.6 g) going down, with min 400ms between peaks.
 *   5. Each full up→down crossing = 1 rep.
 *   Watch-side variant uses CMRotationRate around the band axis for
 *   curls / extensions; iPhone-side uses pocketed accelerometer for jumps.
 */

type Bridge = {
  startWorkout: () => Promise<{ sessionId: string }>;
  stopWorkout: () => Promise<{ saved: boolean }>;
  subscribeHeartRate: () => Promise<void>;
  unsubscribeHeartRate: () => Promise<void>;
};

const HealthKitBridge: Bridge | null =
  Platform.OS === "ios" && NativeModules.HealthKitBridge
    ? (NativeModules.HealthKitBridge as Bridge)
    : null;

// Wire the native event stream → __pushHeartRateFromNative once at module init.
if (HealthKitBridge && Platform.OS === "ios") {
  try {
    const emitter = new NativeEventEmitter(
      NativeModules.HealthKitBridge as any
    );
    emitter.addListener("HealthKitHeartRate", (e: { bpm: number }) => {
      if (typeof e?.bpm === "number") __pushHeartRateFromNative(e.bpm);
    });
  } catch (e) {
    console.warn("[Health] event emitter init failed", e);
  }
}

type HRListener = (bpm: number | null) => void;
const hrListeners = new Set<HRListener>();

export const isHealthAvailable = (): boolean => HealthKitBridge !== null;

export async function startWorkout(): Promise<void> {
  if (!HealthKitBridge) return;
  try {
    await HealthKitBridge.startWorkout();
  } catch (e) {
    console.warn("[Health] startWorkout failed", e);
  }
}

export async function stopWorkout(): Promise<void> {
  if (!HealthKitBridge) return;
  try {
    await HealthKitBridge.stopWorkout();
  } catch (e) {
    console.warn("[Health] stopWorkout failed", e);
  }
}

/**
 * Subscribe to live BPM updates. Returns unsubscribe function.
 * When no Apple Watch is paired, listener will never fire — UI shows '–'.
 */
export function subscribeHeartRate(cb: HRListener): () => void {
  hrListeners.add(cb);
  if (HealthKitBridge && hrListeners.size === 1) {
    HealthKitBridge.subscribeHeartRate().catch(() => {});
  }
  return () => {
    hrListeners.delete(cb);
    if (HealthKitBridge && hrListeners.size === 0) {
      HealthKitBridge.unsubscribeHeartRate().catch(() => {});
    }
  };
}

/** Native bridge calls this via DeviceEventEmitter (wired in HealthKitBridge.m). */
export function __pushHeartRateFromNative(bpm: number) {
  hrListeners.forEach((l) => l(bpm));
}
