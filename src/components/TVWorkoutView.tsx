import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography } from "@/src/theme";

type Props = {
  exerciseName: string;
  nextExerciseName?: string;
  timerText: string;
  setText: string;
  bandColor: string;
};

export function TVWorkoutView({
  exerciseName,
  nextExerciseName,
  timerText,
  setText,
  bandColor,
}: Props) {
  return (
    <View style={styles.root} testID="tv-workout-view">
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>ESERCIZIO</Text>
          <Text style={[styles.exercise, { color: bandColor }]} numberOfLines={2}>
            {exerciseName}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.label}>SERIE</Text>
          <Text style={styles.setText}>{setText}</Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.timer}>{timerText}</Text>
      </View>

      <View style={styles.bottom}>
        <Ionicons name="arrow-forward-circle" size={28} color={colors.muted} />
        <Text style={styles.next}>{nextExerciseName ?? "Ultimo esercizio"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.xxl,
    justifyContent: "space-between",
  },
  topRow: { flexDirection: "row", alignItems: "flex-start" },
  right: { alignItems: "flex-end", gap: spacing.md },
  label: {
    color: colors.muted,
    fontSize: typography.lg,
    letterSpacing: 4,
    fontWeight: "600",
  },
  exercise: { fontSize: typography.hero, fontWeight: "800", marginTop: 8 },
  setText: {
    color: colors.onSurface,
    fontSize: typography.xxxl,
    fontWeight: "700",
  },
  center: { alignItems: "center", justifyContent: "center", flex: 1 },
  timer: {
    color: colors.onSurface,
    fontSize: typography.mega,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  bottom: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  next: { color: colors.muted, fontSize: 40, fontWeight: "600" },
});