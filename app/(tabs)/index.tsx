import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { PREDEFINED_WORKOUTS, type Workout } from "@/src/data/workouts";
import { EXERCISES_BY_ID } from "@/src/data/exercises";
import {
  bandHex,
  categoryIcon,
  categoryLabel,
  colors,
  radius,
  spacing,
  typography,
} from "@/src/theme";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { sessions, customWorkouts, startWorkout, refresh } = useWorkout();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const quickStart = (w: Workout) => {
    startWorkout(w);
    router.push("/(tabs)/active");
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor={colors.muted}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Inizio</Text>
          <Text style={styles.subtitle}>Allena con i tuoi elastici</Text>
        </View>

        <Text style={styles.sectionTitle}>Avvio Rapido</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {PREDEFINED_WORKOUTS.map((w) => {
            const firstEx = EXERCISES_BY_ID[w.exercises[0].exerciseId];
            const band = firstEx ? bandHex[firstEx.band] : colors.brand;
            return (
              <Pressable
                key={w.id}
                testID={`quickstart-${w.id}`}
                onPress={() => quickStart(w)}
                style={({ pressed }) => [
                  styles.quickCard,
                  { borderColor: band },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[styles.quickIcon, { backgroundColor: band }]}>
                  <Ionicons
                    name={categoryIcon[w.category] as any}
                    size={24}
                    color={colors.surface}
                  />
                </View>
                <Text style={styles.quickName}>{w.name}</Text>
                <Text style={styles.quickMeta}>
                  {w.exercises.length} esercizi
                </Text>
                <View style={styles.playPill}>
                  <Ionicons name="play" size={14} color={colors.surface} />
                  <Text style={styles.playPillText}>Inizia</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {customWorkouts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>I tuoi Allenamenti</Text>
            {customWorkouts.map((w) => (
              <Pressable
                key={w.id}
                testID={`custom-workout-${w.id}`}
                onPress={() => quickStart(w)}
                style={({ pressed }) => [
                  styles.listRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.listIcon}>
                  <Ionicons
                    name="fitness"
                    size={22}
                    color={colors.brand}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listName}>{w.name}</Text>
                  <Text style={styles.listMeta}>
                    {w.exercises.length} esercizi · {categoryLabel[w.category]}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={28} color={colors.brand} />
              </Pressable>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Sessioni Recenti</Text>
        {sessions.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={42} color={colors.muted} />
            <Text style={styles.emptyText}>
              Non ci sono allenamenti recenti.
            </Text>
            <Text style={styles.emptyHint}>
              Avvia un allenamento per vedere la cronologia qui.
            </Text>
          </View>
        ) : (
          sessions.slice(0, 8).map((s) => (
            <View key={s.id} style={styles.listRow} testID={`session-${s.id}`}>
              <View style={styles.listIcon}>
                <Ionicons
                  name="checkmark-done"
                  size={22}
                  color={colors.success}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listName}>{s.workoutName}</Text>
                <Text style={styles.listMeta}>
                  {formatDate(s.date)} · {formatDuration(s.duration)} ·{" "}
                  {s.calories} kcal
                </Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
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
  sectionTitle: {
    color: colors.onSurface,
    fontSize: typography.xl,
    fontWeight: "700",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  quickRow: { gap: spacing.sm, paddingRight: spacing.lg },
  quickCard: {
    width: 140,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    gap: 6,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  quickName: {
    color: colors.onSurface,
    fontSize: typography.base,
    fontWeight: "700",
  },
  quickMeta: { color: colors.muted, fontSize: typography.sm },
  playPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  playPillText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: 11,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  listName: {
    color: colors.onSurface,
    fontSize: typography.lg,
    fontWeight: "600",
  },
  listMeta: { color: colors.muted, fontSize: typography.sm, marginTop: 2 },
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
});
