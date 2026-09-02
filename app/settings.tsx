import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Switch, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWorkout } from "@/src/context/WorkoutContext";
import { clearAll } from "@/src/services/storage";
import { uiStrings, aiEngine, legal } from "@/src/config";
import { bandHex, bandLabel, colors, radius, spacing, typography, type BandColor } from "@/src/theme";

const ALL_BANDS: BandColor[] = ["yellow", "red", "black", "purple"];

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings, refresh } = useWorkout();
  const [confirmClear, setConfirmClear] = useState(false);

  const toggleBand = (b: BandColor) => {
    const owned = settings.ownedBands.includes(b)
      ? settings.ownedBands.filter((x) => x !== b)
      : [...settings.ownedBands, b];
    updateSettings({ ownedBands: owned });
  };

  const adjustRest = (delta: number) => {
    const { min, max } = aiEngine.defaultRestSecondsRange;
    const next = Math.min(max, Math.max(min, settings.defaultRestSeconds + delta));
    updateSettings({ defaultRestSeconds: next });
  };

  const adjustExercises = (delta: number) => {
    const { min, max } = aiEngine.exercisesPerSessionRange;
    const next = Math.min(max, Math.max(min, settings.aiExercisesPerSession + delta));
    updateSettings({ aiExercisesPerSession: next });
  };

  const exportData = async () => {
    if (Platform.OS !== "web") return;
    const keys = [
      legal.storageKeys.weeklyProgram,
      legal.storageKeys.settings,
      legal.storageKeys.personalProfile,
    ];
    const pairs = await AsyncStorage.multiGet(keys);
    const data: Record<string, unknown> = {};
    pairs.forEach(([k, v]) => {
      if (v) {
        try {
          data[k] = JSON.parse(v);
        } catch {
          data[k] = v;
        }
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bandfit-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doClear = async () => {
    await clearAll();
    await refresh();
    setConfirmClear(false);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-down" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>{uiStrings.settings.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{uiStrings.settings.audioCoach}</Text>
            <Text style={styles.cardHint}>{uiStrings.settings.audioCoachHint}</Text>
          </View>
          <Switch
            testID="settings-audio-coach"
            value={settings.audioCoachEnabled}
            onValueChange={(v) => updateSettings({ audioCoachEnabled: v })}
          />
        </View>

        <View style={[styles.card, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{uiStrings.settings.haptics}</Text>
            <Text style={styles.cardHint}>{uiStrings.settings.hapticsHint}</Text>
          </View>
          <Switch
            testID="settings-haptics"
            value={settings.hapticsEnabled}
            onValueChange={(v) => updateSettings({ hapticsEnabled: v })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{uiStrings.settings.myBands}</Text>
          <Text style={styles.cardHint}>{uiStrings.settings.myBandsHint}</Text>
          <View style={styles.bandsRow}>
            {ALL_BANDS.map((b) => {
              const owned = settings.ownedBands.includes(b);
              return (
                <Pressable
                  key={b}
                  testID={`settings-band-${b}`}
                  onPress={() => toggleBand(b)}
                  style={[
                    styles.bandChip,
                    { borderColor: bandHex[b] },
                    owned && { backgroundColor: bandHex[b] },
                  ]}
                >
                  {owned && <Ionicons name="checkmark" size={14} color={colors.surface} />}
                  <Text style={[styles.bandChipText, owned && { color: colors.surface }]}>
                    {bandLabel[b]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.row]}>
          <Text style={styles.cardLabel}>{uiStrings.settings.defaultRest}</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperBtn} onPress={() => adjustRest(-5)}>
              <Ionicons name="remove" size={16} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.stepperValue}>{settings.defaultRestSeconds}s</Text>
            <Pressable style={styles.stepperBtn} onPress={() => adjustRest(5)}>
              <Ionicons name="add" size={16} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, styles.row]}>
          <Text style={styles.cardLabel}>{uiStrings.settings.aiExercisesPerSession}</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepperBtn} onPress={() => adjustExercises(-1)}>
              <Ionicons name="remove" size={16} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.stepperValue}>{settings.aiExercisesPerSession}</Text>
            <Pressable style={styles.stepperBtn} onPress={() => adjustExercises(1)}>
              <Ionicons name="add" size={16} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{uiStrings.settings.dataSection}</Text>

        <Pressable testID="export-data" style={styles.dataRow} onPress={exportData}>
          <Ionicons name="download-outline" size={20} color={colors.brandSecondary} />
          <Text style={styles.dataRowText}>{uiStrings.settings.exportData}</Text>
        </Pressable>

        {!confirmClear ? (
          <Pressable
            testID="clear-data"
            style={styles.dataRow}
            onPress={() => setConfirmClear(true)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={[styles.dataRowText, { color: colors.error }]}>
              {uiStrings.settings.clearData}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>{uiStrings.settings.clearDataConfirm}</Text>
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
              <Pressable testID="confirm-clear-data" style={styles.dangerBtn} onPress={doClear}>
                <Text style={styles.dangerBtnText}>Conferma</Text>
              </Pressable>
              <Pressable
                style={styles.cancelDeleteBtn}
                onPress={() => setConfirmClear(false)}
              >
                <Text style={styles.cancelDeleteText}>{uiStrings.common.cancel}</Text>
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
  headerTitle: { color: colors.onSurface, fontSize: typography.lg, fontWeight: "700" },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardLabel: { color: colors.onSurface, fontSize: typography.base, fontWeight: "700" },
  cardHint: { color: colors.muted, fontSize: typography.sm },
  bandsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  bandChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  bandChipText: { color: colors.onSurface, fontSize: typography.sm, fontWeight: "600" },
  stepper: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: { color: colors.onSurface, fontWeight: "700", minWidth: 40, textAlign: "center" },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: typography.base,
    fontWeight: "700",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  dataRowText: { color: colors.onSurface, fontSize: typography.base, fontWeight: "600" },
  confirmBox: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  confirmText: { color: colors.onSurface, fontSize: typography.sm },
  dangerBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  dangerBtnText: { color: colors.onSurface, fontWeight: "800" },
  cancelDeleteBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  cancelDeleteText: { color: colors.onSurface, fontWeight: "700" },
});
