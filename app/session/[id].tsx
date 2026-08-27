import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { colors, radius, spacing, typography } from "@/src/theme";

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sessions, removeSession } = useWorkout();
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const session = sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-down" size={26} color={colors.onSurface} />
          </Pressable>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sessione non trovata</Text>
        </View>
      </SafeAreaView>
    );
  }

  const doDelete = async () => {
    await removeSession(session.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-down" size={26} color={colors.onSurface} />
        </Pressable>
        <Pressable
          testID="delete-session"
          onPress={() => setConfirmDelete(true)}
          hitSlop={12}
        >
          <Ionicons name="trash" size={22} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{session.workoutName}</Text>
        <Text style={styles.date}>
          {new Date(session.date).toLocaleDateString("it-IT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="time" size={20} color={colors.brandSecondary} />
            <Text style={styles.statValue}>{fmtDuration(session.duration)}</Text>
            <Text style={styles.statLabel}>Durata</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="flame" size={20} color={colors.error} />
            <Text style={styles.statValue}>{session.calories}</Text>
            <Text style={styles.statLabel}>Kcal</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Esercizi</Text>
        {session.exercises && session.exercises.length > 0 ? (
          session.exercises.map((e, i) => (
            <View key={`${e.exerciseId}-${i}`} style={styles.exRow}>
              <View style={styles.exIcon}>
                <Ionicons name="barbell" size={18} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exName}>{e.name}</Text>
                <Text style={styles.exMeta}>
                  {e.sets} serie · {e.reps} reps
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyHint}>
            Dettaglio esercizi non disponibile per questa sessione.
          </Text>
        )}

        {confirmDelete && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              Eliminare questa sessione dalla cronologia?
            </Text>
            <View style={styles.confirmRow}>
              <Pressable
                testID="confirm-delete-session"
                style={styles.dangerBtn}
                onPress={doDelete}
              >
                <Text style={styles.dangerBtnText}>Elimina</Text>
              </Pressable>
              <Pressable
                style={styles.cancelDeleteBtn}
                onPress={() => setConfirmDelete(false)}
              >
                <Text style={styles.cancelDeleteText}>Annulla</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
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
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  title: { color: colors.onSurface, fontSize: typography.xxl, fontWeight: "800" },
  date: { color: colors.muted, fontSize: typography.base, marginTop: 4, textTransform: "capitalize" },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: 4,
  },
  statValue: { color: colors.onSurface, fontSize: typography.xl, fontWeight: "800", marginTop: 6 },
  statLabel: { color: colors.muted, fontSize: typography.sm },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: typography.lg,
    fontWeight: "700",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  exIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  exName: { color: colors.onSurface, fontSize: typography.base, fontWeight: "600" },
  exMeta: { color: colors.muted, fontSize: typography.sm, marginTop: 2 },
  emptyHint: { color: colors.muted },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.muted },
  confirmBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  confirmText: { color: colors.onSurface, fontSize: typography.base },
  confirmRow: { flexDirection: "row", gap: spacing.sm },
  dangerBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  dangerBtnText: { color: colors.onSurface, fontWeight: "800" },
  cancelDeleteBtn: {
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  cancelDeleteText: { color: colors.onSurface, fontWeight: "700" },
});
