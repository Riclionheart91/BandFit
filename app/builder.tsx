import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { EXERCISES, EXERCISES_BY_ID } from "@/src/data/exercises";
import type { Workout, WorkoutExercise } from "@/src/data/workouts";
import { useWorkout } from "@/src/context/WorkoutContext";
import {
  bandHex,
  categoryLabel,
  colors,
  radius,
  spacing,
  typography,
  type Category,
} from "@/src/theme";

const CATS: { id: Category; label: string }[] = [
  { id: "full_body", label: categoryLabel.full_body },
  { id: "upper", label: categoryLabel.upper },
  { id: "core", label: categoryLabel.core },
  { id: "lower", label: categoryLabel.lower },
];

export default function BuilderScreen() {
  const router = useRouter();
  const { addCustomWorkout } = useWorkout();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("full_body");
  const [picked, setPicked] = useState<WorkoutExercise[]>([]);

  const available = useMemo(
    () => EXERCISES.filter((e) => !picked.find((p) => p.exerciseId === e.id)),
    [picked]
  );

  const add = (id: string) =>
    setPicked((p) => [...p, { exerciseId: id, sets: 3, reps: 12, rest: 45 }]);

  const remove = (id: string) =>
    setPicked((p) => p.filter((x) => x.exerciseId !== id));

  const update = (id: string, patch: Partial<WorkoutExercise>) =>
    setPicked((p) =>
      p.map((x) => (x.exerciseId === id ? { ...x, ...patch } : x))
    );

  const canSave = name.trim().length > 0 && picked.length > 0;

  const save = async () => {
    if (!canSave) return;
    const w: Workout = {
      id: `cw-${Date.now()}`,
      name: name.trim(),
      category,
      description: "Allenamento personalizzato",
      exercises: picked,
    };
    await addCustomWorkout(w);
    router.back();
  };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Pressable
            testID="builder-close"
            onPress={() => router.back()}
            hitSlop={12}
          >
            <Ionicons name="close" size={26} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Crea Allenamento</Text>
          <Pressable
            testID="builder-save"
            onPress={save}
            disabled={!canSave}
            style={[styles.saveBtn, !canSave && { opacity: 0.4 }]}
          >
            <Text style={styles.saveText}>Salva</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Nome</Text>
          <TextInput
            testID="builder-name"
            value={name}
            onChangeText={setName}
            placeholder="Es. Routine mattutina"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.catRow}>
            {CATS.map((c) => {
              const active = category === c.id;
              return (
                <Pressable
                  key={c.id}
                  testID={`builder-cat-${c.id}`}
                  onPress={() => setCategory(c.id)}
                  style={[
                    styles.chip,
                    active && { backgroundColor: colors.onSurface },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active && { color: colors.surface, fontWeight: "700" },
                    ]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>
            Esercizi Selezionati ({picked.length})
          </Text>
          {picked.length === 0 ? (
            <Text style={styles.hint}>
              Aggiungi esercizi dalla lista qui sotto
            </Text>
          ) : (
            picked.map((p) => {
              const e = EXERCISES_BY_ID[p.exerciseId];
              if (!e) return null;
              return (
                <View
                  key={p.exerciseId}
                  style={styles.pickedRow}
                  testID={`picked-${p.exerciseId}`}
                >
                  <View
                    style={[styles.bandDot, { backgroundColor: bandHex[e.band] }]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickedName}>{e.name}</Text>
                    <View style={styles.numRow}>
                      <NumStep
                        label="Serie"
                        value={p.sets}
                        onMinus={() =>
                          update(p.exerciseId, {
                            sets: Math.max(1, p.sets - 1),
                          })
                        }
                        onPlus={() =>
                          update(p.exerciseId, { sets: p.sets + 1 })
                        }
                      />
                      <NumStep
                        label="Reps"
                        value={p.reps}
                        onMinus={() =>
                          update(p.exerciseId, {
                            reps: Math.max(1, p.reps - 1),
                          })
                        }
                        onPlus={() =>
                          update(p.exerciseId, { reps: p.reps + 1 })
                        }
                      />
                      <NumStep
                        label="Rec s"
                        value={p.rest}
                        onMinus={() =>
                          update(p.exerciseId, {
                            rest: Math.max(0, p.rest - 15),
                          })
                        }
                        onPlus={() =>
                          update(p.exerciseId, { rest: p.rest + 15 })
                        }
                      />
                    </View>
                  </View>
                  <Pressable
                    testID={`remove-${p.exerciseId}`}
                    onPress={() => remove(p.exerciseId)}
                    hitSlop={10}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </Pressable>
                </View>
              );
            })
          )}

          <Text style={styles.label}>Aggiungi Esercizi</Text>
          {available.map((e) => (
            <Pressable
              key={e.id}
              testID={`add-ex-${e.id}`}
              onPress={() => add(e.id)}
              style={({ pressed }) => [
                styles.addRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.bandDot,
                  { backgroundColor: bandHex[e.band] },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.pickedName}>{e.name}</Text>
                <Text style={styles.metaText}>{categoryLabel[e.category]}</Text>
              </View>
              <Ionicons name="add-circle" size={24} color={colors.brand} />
            </Pressable>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function NumStep({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.numStep}>
      <Text style={styles.numLabel}>{label}</Text>
      <View style={styles.numCtrl}>
        <Pressable
          onPress={onMinus}
          hitSlop={8}
          style={styles.numBtn}
        >
          <Ionicons name="remove" size={16} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.numVal}>{value}</Text>
        <Pressable onPress={onPlus} hitSlop={8} style={styles.numBtn}>
          <Ionicons name="add" size={16} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: { color: colors.onSurface, fontSize: typography.xl, fontWeight: "700" },
  saveBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  saveText: { color: colors.surface, fontWeight: "700" },
  body: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  label: {
    color: colors.muted,
    fontSize: typography.sm,
    fontWeight: "600",
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    color: colors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    fontSize: typography.lg,
  },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.pill,
  },
  chipText: { color: colors.onSurfaceSecondary, fontSize: typography.base },
  hint: { color: colors.muted, fontSize: typography.base },
  pickedRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  pickedName: {
    color: colors.onSurface,
    fontSize: typography.lg,
    fontWeight: "600",
  },
  metaText: { color: colors.muted, fontSize: typography.sm, marginTop: 2 },
  bandDot: { width: 10, height: 40, borderRadius: 4 },
  numRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  numStep: { flex: 1, gap: 4 },
  numLabel: { color: colors.muted, fontSize: typography.sm },
  numCtrl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    justifyContent: "space-between",
  },
  numBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  numVal: {
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: typography.base,
    minWidth: 28,
    textAlign: "center",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
});
