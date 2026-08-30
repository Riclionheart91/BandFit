import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as KeepAwake from "expo-keep-awake";
import { useWorkout } from "@/src/context/WorkoutContext";
import { Timer } from "@/src/components/Timer";
import { MobileWorkoutController } from "@/src/components/MobileWorkoutController";
import { TVWorkoutView } from "@/src/components/TVWorkoutView";
import { subscribeExternalDisplay } from "@/src/services/externalDisplay";
import { getExerciseGifMap } from "@/src/services/exerciseGifs";
import { EXERCISES_BY_ID } from "@/src/data/exercises";
import { PREDEFINED_WORKOUTS } from "@/src/data/workouts";
import { uiStrings } from "@/src/config";
import {
  bandHex,
  colors,
  radius,
  spacing,
  typography,
} from "@/src/theme";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    snapshot,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    completeSet,
    skipExercise,
    endWorkout,
    cancelWorkout,
    weeklyProgram,
    batterySaver,
  } = useWorkout();
  const [external, setExternal] = useState(false);
  const [rpeStep, setRpeStep] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [gifs, setGifs] = useState<Record<string, string>>({});

  useEffect(() => {
    getExerciseGifMap().then(setGifs).catch(() => {});
  }, []);

  const isAiSession =
    !!activeWorkout &&
    !!weeklyProgram?.days.some((d) => d.workout.id === activeWorkout.id && !d.completed);

  const finishWorkout = async (rpe?: number) => {
    await endWorkout(rpe);
    setRpeStep(false);
    router.push("/(tabs)");
  };

  const doCancel = () => {
    cancelWorkout();
    setConfirmCancel(false);
    router.push("/(tabs)");
  };

  useEffect(() => {
    KeepAwake.activateKeepAwakeAsync("active-workout").catch(() => {});
    return () => {
      try {
        KeepAwake.deactivateKeepAwake("active-workout");
      } catch {}
    };
  }, []);

  useEffect(() => subscribeExternalDisplay(setExternal), []);

  if (!activeWorkout || !snapshot) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.emptyWrap}>
          <Ionicons name="barbell" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>Nessun allenamento attivo</Text>
          <Text style={styles.emptyHint}>
            Scegli un allenamento per iniziare
          </Text>
          <View style={{ height: spacing.lg }} />
          {PREDEFINED_WORKOUTS.map((w) => (
            <Pressable
              key={w.id}
              testID={`empty-start-${w.id}`}
              onPress={() => startWorkout(w)}
              style={({ pressed }) => [
                styles.startBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="play-circle" size={22} color={colors.brand} />
              <Text style={styles.startBtnText}>{w.name}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.muted}
              />
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (rpeStep) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>{uiStrings.profile.rpePrompt}</Text>
          <View style={styles.rpeRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <Pressable
                key={n}
                testID={`rpe-${n}`}
                style={styles.rpeBtn}
                onPress={() => finishWorkout(n)}
              >
                <Text style={styles.rpeBtnText}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable testID="rpe-skip" onPress={() => finishWorkout(undefined)}>
            <Text style={styles.emptyHint}>{uiStrings.profile.rpeSkip}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const ex = snapshot.currentExercise
    ? EXERCISES_BY_ID[snapshot.currentExercise.exerciseId]
    : null;
  const nextEx = snapshot.nextExercise
    ? EXERCISES_BY_ID[snapshot.nextExercise.exerciseId]
    : null;
  const band = ex ? bandHex[ex.band] : colors.brand;

  const isRest = snapshot.state === "rest";
  const currentEx = snapshot.currentExercise!;
  const restTotal = currentEx.rest || 1;
  const progress = isRest
    ? 1 - snapshot.restRemaining / restTotal
    : (snapshot.setIndex + 1) / currentEx.sets;
  const timerText = isRest
    ? fmt(snapshot.restRemaining)
    : fmt(snapshot.elapsed);
  const stateLabel =
    snapshot.state === "rest"
      ? "RIPOSO"
      : snapshot.state === "paused"
      ? "IN PAUSA"
      : snapshot.state === "done"
      ? "COMPLETATO"
      : "ATTIVO";
  const setText = `${snapshot.setIndex + 1} / ${currentEx.sets} · ${currentEx.reps} reps`;
  const gifUrl = ex ? gifs[ex.id] : undefined;
  const showGif = !!gifUrl && !(isRest && batterySaver);

  const header = (
    <View style={styles.topRow}>
      <Pressable
        testID="cancel-active"
        onPress={() => setConfirmCancel(true)}
        hitSlop={12}
        style={styles.cancelBtn}
      >
        <Text style={styles.cancelBtnText}>Annulla</Text>
      </Pressable>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.workoutName}>{activeWorkout.name}</Text>
        <Text style={[styles.stateBadge, { color: band }]}>{stateLabel}</Text>
      </View>
      <View style={{ width: 60 }} />
    </View>
  );

  const controller = (
    <MobileWorkoutController
      state={snapshot.state}
      onStart={() => activeWorkout && startWorkout(activeWorkout)}
      onPause={pauseWorkout}
      onResume={resumeWorkout}
      onCompleteSet={completeSet}
      onSkip={skipExercise}
      onEnd={async () => {
        if (isAiSession) {
          setRpeStep(true);
        } else {
          await finishWorkout(undefined);
        }
      }}
    />
  );

  if (confirmCancel) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        {header}
        <View style={styles.emptyWrap}>
          <Ionicons name="warning" size={40} color={colors.error} />
          <Text style={styles.emptyTitle}>Annullare l'allenamento?</Text>
          <Text style={styles.emptyHint}>
            Il progresso di questa sessione non verrà salvato.
          </Text>
          <View style={{ height: spacing.lg }} />
          <Pressable
            testID="confirm-cancel"
            style={styles.dangerBtn}
            onPress={doCancel}
          >
            <Text style={styles.dangerBtnText}>Sì, annulla</Text>
          </Pressable>
          <Pressable
            testID="dismiss-cancel"
            style={{ marginTop: spacing.md }}
            onPress={() => setConfirmCancel(false)}
          >
            <Text style={styles.emptyHint}>No, continua ad allenarmi</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (external && ex) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        {header}
        <TVWorkoutView
          exerciseName={ex.name}
          nextExerciseName={nextEx?.name}
          timerText={timerText}
          setText={setText}
          bandColor={band}
        />
        {controller}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {header}

      <View style={styles.center}>
        {showGif && (
          <Image
            source={{ uri: gifUrl }}
            style={styles.exerciseGif}
            resizeMode="cover"
          />
        )}
        <Text style={styles.exerciseName} numberOfLines={2}>
          {ex?.name ?? "—"}
        </Text>
        <Text style={styles.setInfo}>{setText}</Text>
        <View style={{ height: spacing.md }} />
        <Timer
          size={200}
          strokeWidth={12}
          progress={Math.min(1, Math.max(0, progress))}
          color={band}
          primaryText={timerText}
          secondaryText={isRest ? "RIPOSO" : "TEMPO"}
        />
        {nextEx ? (
          <View style={styles.nextBox}>
            <Ionicons
              name="arrow-forward-circle"
              size={16}
              color={colors.muted}
            />
            <Text style={styles.nextLabel}>Prossimo:</Text>
            <Text style={styles.nextName} numberOfLines={1}>
              {nextEx.name}
            </Text>
          </View>
        ) : (
          <View style={styles.nextBox}>
            <Ionicons name="trophy" size={16} color={colors.warning} />
            <Text style={styles.nextLabel}>Ultimo esercizio</Text>
          </View>
        )}
      </View>

      {controller}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelBtn: { width: 60 },
  cancelBtnText: { color: colors.error, fontSize: typography.base, fontWeight: "600" },
  workoutName: {
    color: colors.onSurface,
    fontSize: typography.base,
    fontWeight: "700",
  },
  stateBadge: { fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: 6,
  },
  exerciseName: {
    color: colors.onSurface,
    fontSize: typography.xxl,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  exerciseGif: {
    width: 180,
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    marginBottom: spacing.sm,
  },
  setInfo: { color: colors.muted, fontSize: typography.base, letterSpacing: 1 },
  nextBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    maxWidth: "100%",
  },
  nextLabel: { color: colors.muted, fontSize: typography.sm },
  nextName: {
    color: colors.onSurface,
    fontSize: typography.sm,
    fontWeight: "600",
    flexShrink: 1,
  },
  emptyWrap: {
    flex: 1,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: typography.xl,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyHint: { color: colors.muted, textAlign: "center" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    width: "100%",
    marginBottom: spacing.sm,
  },
  startBtnText: {
    color: colors.onSurface,
    fontSize: typography.base,
    fontWeight: "600",
    flex: 1,
  },
  dangerBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  dangerBtnText: { color: colors.onSurface, fontWeight: "800", fontSize: typography.base },
  rpeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  rpeBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  rpeBtnText: {
    color: colors.onSurface,
    fontWeight: "800",
    fontSize: typography.base,
  },
});
