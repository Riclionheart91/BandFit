import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { WeeklyProgram, DaySession } from "@/src/services/periodization";
import { colors, radius, spacing, typography } from "@/src/theme";

const SPLIT_LABEL: Record<string, string> = {
  upper: "Sup",
  lower: "Inf",
  core: "Core",
  full_body: "Full",
};

const SPLIT_COLOR: Record<string, string> = {
  upper: colors.brandSecondary,
  lower: colors.brand,
  core: colors.warning,
  full_body: colors.error,
};

type Props = {
  program: WeeklyProgram;
  onStartDay?: (day: DaySession) => void;
};

export function WeeklyProgramCalendar({ program, onStartDay }: Props) {
  const [selected, setSelected] = useState<DaySession | null>(null);

  const weeks: DaySession[][] = [];
  for (let w = 1; w <= 6; w++) {
    weeks.push(program.days.filter((d) => d.week === w));
  }

  const isCurrent = (d: DaySession) =>
    d.week === program.currentWeek && d.dayIndex === program.currentDay;

  return (
    <View>
      {weeks.map((row, wi) => {
        const weekNum = wi + 1;
        const isDeloadWeek = row[0]?.isDeload;
        return (
          <View key={weekNum} style={styles.weekRow}>
            <View style={styles.weekLabelBox}>
              <Text style={styles.weekLabel}>S{weekNum}</Text>
              {isDeloadWeek && <Text style={styles.deloadTag}>scarico</Text>}
            </View>
            <View style={styles.daysRow}>
              {row.map((d) => {
                const current = isCurrent(d);
                const color = SPLIT_COLOR[d.split] ?? colors.muted;
                return (
                  <Pressable
                    key={`${d.week}-${d.dayIndex}`}
                    testID={`program-day-${d.week}-${d.dayIndex}`}
                    onPress={() => setSelected(d)}
                    style={[
                      styles.dayCell,
                      { borderColor: current ? color : "transparent" },
                      d.completed && { opacity: 0.5 },
                    ]}
                  >
                    {d.completed ? (
                      <Ionicons name="checkmark" size={14} color={color} />
                    ) : (
                      <View style={[styles.dot, { backgroundColor: color }]} />
                    )}
                    <Text style={[styles.dayLabel, { color }]}>
                      {SPLIT_LABEL[d.split] ?? d.split}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      {selected && (
        <View style={styles.detailBox}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{selected.workout.name}</Text>
            <Pressable onPress={() => setSelected(null)} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.muted} />
            </Pressable>
          </View>
          <Text style={styles.detailMeta}>
            {selected.workout.exercises.length} esercizi
            {selected.isDeload ? " · settimana di scarico" : ""}
            {selected.completed && selected.rpe != null
              ? ` · completato (RPE ${selected.rpe})`
              : ""}
          </Text>
          {isCurrent(selected) && !selected.completed && onStartDay && (
            <Pressable
              testID="calendar-start-day"
              style={styles.startBtn}
              onPress={() => onStartDay(selected)}
            >
              <Ionicons name="play-circle" size={18} color={colors.surface} />
              <Text style={styles.startBtnText}>Inizia questo allenamento</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm, gap: spacing.sm },
  weekLabelBox: { width: 40 },
  weekLabel: { color: colors.onSurface, fontSize: typography.sm, fontWeight: "700" },
  deloadTag: { color: colors.warning, fontSize: 9, fontWeight: "600" },
  daysRow: { flex: 1, flexDirection: "row", gap: 6 },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    borderWidth: 2,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dayLabel: { fontSize: 9, fontWeight: "700" },
  detailBox: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailTitle: { color: colors.onSurface, fontSize: typography.base, fontWeight: "700", flexShrink: 1 },
  detailMeta: { color: colors.muted, fontSize: typography.sm },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  startBtnText: { color: colors.surface, fontWeight: "800", fontSize: typography.sm },
});
