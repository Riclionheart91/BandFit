import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { colors, radius, spacing, typography } from "@/src/theme";

type Props = {
  state: "idle" | "active" | "paused" | "rest" | "done";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCompleteSet: () => void;
  onSkip: () => void;
  onEnd: () => void;
};

export function MobileWorkoutController({
  state,
  onStart,
  onPause,
  onResume,
  onCompleteSet,
  onSkip,
  onEnd,
}: Props) {
  const isPlaying = state === "active" || state === "rest";

  return (
    <BlurView intensity={80} tint="dark" style={styles.bar}>
      <View style={styles.row}>
        <CtrlButton
          testID="ctrl-end"
          icon="stop"
          label="Termina"
          color={colors.error}
          onPress={onEnd}
        />

        {state === "idle" || state === "done" ? (
          <PrimaryButton
            testID="ctrl-start"
            label="Inizia"
            icon="play"
            onPress={onStart}
          />
        ) : isPlaying ? (
          <PrimaryButton
            testID="ctrl-set-done"
            label={state === "rest" ? "Salta riposo" : "Serie ✓"}
            icon={state === "rest" ? "play-skip-forward" : "checkmark"}
            onPress={state === "rest" ? onSkip : onCompleteSet}
          />
        ) : (
          <PrimaryButton
            testID="ctrl-resume"
            label="Riprendi"
            icon="play"
            onPress={onResume}
          />
        )}

        {isPlaying ? (
          <CtrlButton
            testID="ctrl-pause"
            icon="pause"
            label="Pausa"
            color={colors.warning}
            onPress={onPause}
          />
        ) : (
          <CtrlButton
            testID="ctrl-skip"
            icon="play-skip-forward"
            label="Salta"
            color={colors.brandSecondary}
            onPress={onSkip}
          />
        )}
      </View>
    </BlurView>
  );
}

function PrimaryButton({
  label,
  icon,
  onPress,
  testID,
}: {
  label: string;
  icon: any;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.primary, pressed && { opacity: 0.75 }]}
    >
      <Ionicons name={icon} size={26} color={colors.surface} />
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

function CtrlButton({
  icon,
  label,
  color,
  onPress,
  testID,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.ctrl, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.ctrlLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  primary: {
    flex: 1,
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primaryLabel: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: typography.lg,
  },
  ctrl: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 56,
  },
  ctrlLabel: { fontSize: typography.sm, fontWeight: "600" },
});
