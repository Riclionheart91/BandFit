import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { colors, radius, spacing, typography } from "@/src/theme";

const DAYS = ["L", "M", "M", "G", "V", "S", "D"];

function startOfWeek(d: Date) {
  const day = (d.getDay() + 6) % 7; // Mon=0
  const nd = new Date(d);
  nd.setDate(d.getDate() - day);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ProgressScreen() {
  const router = useRouter();
  const { sessions, refresh } = useWorkout();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const stats = useMemo(() => {
    const total = sessions.length;
    const totalSec = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalKcal = sessions.reduce((acc, s) => acc + s.calories, 0);

    const weekStart = startOfWeek(new Date());
    const weekly = Array(7).fill(0) as number[];
    sessions.forEach((s) => {
      const dt = new Date(s.date);
      if (dt >= weekStart) {
        const idx = Math.floor(
          (dt.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (idx >= 0 && idx < 7) weekly[idx] += 1;
      }
    });
    const max = Math.max(1, ...weekly);
    return { total, totalSec, totalKcal, weekly, max };
  }, [sessions]);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Progresso</Text>
          <Text style={styles.subtitle}>I tuoi risultati</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat
            icon="checkmark-done-circle"
            color={colors.brand}
            value={String(stats.total)}
            label="Allenamenti"
            testID="stat-total"
          />
          <Stat
            icon="time"
            color={colors.brandSecondary}
            value={fmtDuration(stats.totalSec)}
            label="Tempo Totale"
            testID="stat-time"
          />
          <Stat
            icon="flame"
            color={colors.error}
            value={String(stats.totalKcal)}
            label="Kcal"
            testID="stat-kcal"
          />
        </View>

        <Text style={styles.sectionTitle}>Questa Settimana</Text>
        <View style={styles.chart} testID="weekly-chart">
          {stats.weekly.map((v, i) => {
            const h = Math.max(8, (v / stats.max) * 140);
            const active = v > 0;
            return (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: h,
                      backgroundColor: active
                        ? colors.brand
                        : colors.surfaceTertiary,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{DAYS[i]}</Text>
                <Text style={styles.barValue}>{v}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Cronologia</Text>
        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="analytics-outline" size={42} color={colors.muted} />
            <Text style={styles.emptyText}>
              Nessun dato registrato.
            </Text>
            <Text style={styles.emptyHint}>
              Inizia un allenamento per vedere i tuoi progressi!
            </Text>
          </View>
        ) : (
          sessions.slice(0, 20).map((s) => (
            <Pressable
              key={s.id}
              testID={`session-row-${s.id}`}
              style={({ pressed }) => [
                styles.histRow,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.push(`/session/${s.id}`)}
            >
              <View style={styles.histIcon}>
                <Ionicons
                  name="fitness"
                  size={20}
                  color={colors.brand}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.histName}>{s.workoutName}</Text>
                <Text style={styles.histMeta}>
                  {new Date(s.date).toLocaleDateString("it-IT", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.histDuration}>
                  {fmtDuration(s.duration)}
                </Text>
                <Text style={styles.histKcal}>{s.calories} kcal</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.muted}
                style={{ marginLeft: spacing.sm }}
              />
            </Pressable>
          ))
        )}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  color,
  value,
  label,
  testID,
}: {
  icon: any;
  color: string;
  value: string;
  label: string;
  testID?: string;
}) {
  return (
    <View style={styles.stat} testID={testID}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 140 },
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: {
    color: colors.onSurface,
    fontSize: typography.display,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: { color: colors.muted, fontSize: typography.lg, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: 4,
  },
  statValue: {
    color: colors.onSurface,
    fontSize: typography.xxl,
    fontWeight: "800",
    marginTop: 6,
  },
  statLabel: { color: colors.muted, fontSize: typography.sm },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: typography.xl,
    fontWeight: "700",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  chart: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 220,
  },
  barCol: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
  bar: { width: 18, borderRadius: 4 },
  barLabel: { color: colors.muted, fontSize: typography.sm, marginTop: 6 },
  barValue: {
    color: colors.onSurface,
    fontSize: typography.sm,
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.xl,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  emptyText: { color: colors.onSurface, fontSize: typography.lg },
  emptyHint: {
    color: colors.muted,
    fontSize: typography.base,
    textAlign: "center",
  },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  histIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  histName: {
    color: colors.onSurface,
    fontSize: typography.lg,
    fontWeight: "600",
  },
  histMeta: { color: colors.muted, fontSize: typography.sm, marginTop: 2 },
  histDuration: {
    color: colors.onSurface,
    fontSize: typography.base,
    fontWeight: "600",
  },
  histKcal: { color: colors.muted, fontSize: typography.sm },
});
