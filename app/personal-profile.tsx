import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useWorkout } from "@/src/context/WorkoutContext";
import { uiStrings } from "@/src/config";
import { colors, radius, spacing, typography } from "@/src/theme";
import type { FitnessGoal, FitnessLevel } from "@/src/services/userSettings";

const GOALS: FitnessGoal[] = ["fatloss", "tone", "strength", "endurance"];
const LEVELS: FitnessLevel[] = ["beginner", "intermediate", "advanced"];

export default function PersonalProfileScreen() {
  const router = useRouter();
  const { personalProfile, updatePersonalProfile, isCloudMode } = useWorkout();

  const [name, setName] = useState(personalProfile.name);
  const [age, setAge] = useState(personalProfile.age ? String(personalProfile.age) : "");
  const [weight, setWeight] = useState(personalProfile.weightKg ? String(personalProfile.weightKg) : "");
  const [height, setHeight] = useState(personalProfile.heightCm ? String(personalProfile.heightCm) : "");
  const [goal, setGoal] = useState<FitnessGoal | null>(personalProfile.goal);
  const [level, setLevel] = useState<FitnessLevel | null>(personalProfile.level);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await updatePersonalProfile({
      name: name.trim(),
      age: age ? parseInt(age, 10) || null : null,
      weightKg: weight ? parseFloat(weight.replace(",", ".")) || null : null,
      heightCm: height ? parseInt(height, 10) || null : null,
      goal,
      level,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-down" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>{uiStrings.personalProfile.title}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.syncNote}>
          {isCloudMode ? uiStrings.personalProfile.syncedNote : uiStrings.personalProfile.localOnlyNote}
        </Text>

        <Field label={uiStrings.personalProfile.name}>
          <TextInput
            testID="profile-name"
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Il tuo nome"
            placeholderTextColor={colors.muted}
          />
        </Field>

        <View style={styles.row3}>
          <Field label={uiStrings.personalProfile.age} flex>
            <TextInput
              testID="profile-age"
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor={colors.muted}
            />
          </Field>
          <Field label={uiStrings.personalProfile.weight} flex>
            <TextInput
              testID="profile-weight"
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="—"
              placeholderTextColor={colors.muted}
            />
          </Field>
          <Field label={uiStrings.personalProfile.height} flex>
            <TextInput
              testID="profile-height"
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor={colors.muted}
            />
          </Field>
        </View>

        <Field label={uiStrings.personalProfile.goal}>
          <View style={styles.chipsRow}>
            {GOALS.map((g) => (
              <Pressable
                key={g}
                testID={`goal-${g}`}
                onPress={() => setGoal(g)}
                style={[styles.chip, goal === g && styles.chipActive]}
              >
                <Text style={[styles.chipText, goal === g && styles.chipTextActive]}>
                  {uiStrings.personalProfile.goalOptions[g]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label={uiStrings.personalProfile.level}>
          <View style={styles.chipsRow}>
            {LEVELS.map((l) => (
              <Pressable
                key={l}
                testID={`level-${l}`}
                onPress={() => setLevel(l)}
                style={[styles.chip, level === l && styles.chipActive]}
              >
                <Text style={[styles.chipText, level === l && styles.chipTextActive]}>
                  {uiStrings.personalProfile.levelOptions[l]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <Text style={styles.hint}>{uiStrings.personalProfile.saveHint}</Text>

        <Pressable testID="save-personal-profile" style={styles.saveBtn} onPress={save}>
          <Ionicons
            name={saved ? "checkmark-circle" : "save-outline"}
            size={18}
            color={colors.surface}
          />
          <Text style={styles.saveBtnText}>{saved ? "Salvato" : uiStrings.common.save}</Text>
        </Pressable>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  children,
  flex,
}: {
  label: string;
  children: React.ReactNode;
  flex?: boolean;
}) {
  return (
    <View style={[styles.field, flex && { flex: 1 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
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
  syncNote: { color: colors.muted, fontSize: typography.sm, marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  fieldLabel: { color: colors.muted, fontSize: typography.sm, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.onSurface,
    fontSize: typography.base,
  },
  row3: { flexDirection: "row", gap: spacing.sm },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  chipActive: { backgroundColor: colors.brand },
  chipText: { color: colors.onSurface, fontSize: typography.sm, fontWeight: "600" },
  chipTextActive: { color: colors.surface },
  hint: { color: colors.muted, fontSize: typography.sm, marginTop: spacing.sm, lineHeight: 18 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brand,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.xl,
  },
  saveBtnText: { color: colors.surface, fontWeight: "800", fontSize: typography.base },
});
