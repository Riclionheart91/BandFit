import React from "react";
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { todaysSession } from "@/src/services/periodization";
import { uiStrings } from "@/src/config";
import { colors, radius, spacing, typography } from "@/src/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    isCloudMode,
    loginWithGoogle,
    logout,
    batterySaver,
    setBatterySaver,
    weeklyProgram,
    generateProgram,
    startWorkout,
  } = useWorkout();

  const today = todaysSession(weeklyProgram);

  const startToday = () => {
    if (!today) return;
    startWorkout(today.workout);
    router.push("/(tabs)/active");
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{uiStrings.profile.title}</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {isCloudMode ? uiStrings.profile.cloudSynced : uiStrings.profile.localMode}
          </Text>
          {isCloudMode ? (
            <Pressable testID="profile-logout" style={styles.secondaryBtn} onPress={logout}>
              <Text style={styles.secondaryBtnText}>{uiStrings.profile.logout}</Text>
            </Pressable>
          ) : (
            <Pressable testID="profile-login-google" style={styles.googleBtn} onPress={loginWithGoogle}>
              <Ionicons name="logo-google" size={18} color={colors.surface} />
              <Text style={styles.googleBtnText}>{uiStrings.profile.loginGoogle}</Text>
            </Pressable>
          )}
        </View>

        <View style={[styles.card, styles.row]}>
          <Text style={styles.cardLabel}>{uiStrings.profile.batterySaver}</Text>
          <Switch testID="profile-battery-saver" value={batterySaver} onValueChange={setBatterySaver} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{uiStrings.profile.weeklyProgramTitle}</Text>

          {weeklyProgram ? (
            <>
              <Text style={styles.cardMeta}>
                {uiStrings.profile.weeklyProgramWeek} {weeklyProgram.currentWeek}/6 ·{" "}
                {uiStrings.profile.weeklyProgramActive}
              </Text>
              {today && (
                <Pressable testID="start-today-session" style={styles.startBtn} onPress={startToday}>
                  <Ionicons name="play-circle" size={20} color={colors.surface} />
                  <Text style={styles.startBtnText}>{uiStrings.profile.weeklyProgramStartToday}</Text>
                </Pressable>
              )}
            </>
          ) : (
            <Text style={styles.cardMeta}>{uiStrings.profile.weeklyProgramNone}</Text>
          )}

          <Text style={[styles.cardMeta, { marginTop: spacing.md }]}>
            {uiStrings.profile.weeklyProgramFrequency}
          </Text>
          <View style={styles.freqRow}>
            {[2, 3, 4].map((f) => (
              <Pressable
                key={f}
                testID={`generate-program-${f}`}
                style={styles.freqBtn}
                onPress={() => generateProgram(f as 2 | 3 | 4)}
              >
                <Text style={styles.freqBtnText}>{f}x</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: 140, gap: spacing.md },
  title: {
    color: colors.onSurface,
    fontSize: typography.display,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLabel: { color: colors.onSurface, fontSize: typography.lg, fontWeight: "700" },
  cardMeta: { color: colors.muted, fontSize: typography.base },
  secondaryBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  secondaryBtnText: { color: colors.onSurface, fontWeight: "700" },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  googleBtnText: { color: colors.surface, fontWeight: "800" },
  freqRow: { flexDirection: "row", gap: spacing.sm },
  freqBtn: {
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  freqBtnText: { color: colors.onSurface, fontWeight: "800" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  startBtnText: { color: colors.surface, fontWeight: "800", fontSize: typography.base },
});
