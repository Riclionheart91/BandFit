import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ExerciseCard } from "@/src/components/ExerciseCard";
import { EXERCISES } from "@/src/data/exercises";
import {
  bandHex,
  categoryLabel,
  colors,
  radius,
  spacing,
  typography,
  type BandColor,
  type Category,
} from "@/src/theme";

type Filter = Category | "all";
type BandFilter = BandColor | "all";

const CATS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tutti" },
  { id: "full_body", label: categoryLabel.full_body },
  { id: "upper", label: categoryLabel.upper },
  { id: "core", label: categoryLabel.core },
  { id: "lower", label: categoryLabel.lower },
];

const BANDS: { id: BandFilter; color: string; label: string }[] = [
  { id: "all", color: colors.onSurface, label: "Tutti" },
  { id: "yellow", color: bandHex.yellow, label: "Gialla" },
  { id: "red", color: bandHex.red, label: "Rossa" },
  { id: "black", color: bandHex.black, label: "Nera" },
  { id: "purple", color: bandHex.purple, label: "Viola" },
];

export default function LibraryScreen() {
  const router = useRouter();
  const [cat, setCat] = useState<Filter>("all");
  const [band, setBand] = useState<BandFilter>("all");

  const data = useMemo(
    () =>
      EXERCISES.filter(
        (e) => (cat === "all" || e.category === cat) && (band === "all" || e.band === band)
      ),
    [cat, band]
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Libreria</Text>
        <Text style={styles.subtitle}>{EXERCISES.length} esercizi</Text>
      </View>

      <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CATS.map((c) => {
            const active = cat === c.id;
            return (
              <Pressable
                key={c.id}
                testID={`cat-chip-${c.id}`}
                onPress={() => setCat(c.id)}
                style={[
                  styles.chip,
                  active && { backgroundColor: colors.onSurface },
                ]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {BANDS.map((b) => {
            const active = band === b.id;
            return (
              <Pressable
                key={b.id}
                testID={`band-chip-${b.id}`}
                onPress={() => setBand(b.id)}
                style={[
                  styles.chip,
                  active && { borderColor: b.color, borderWidth: 1.5 },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: b.color }]} />
                <Text style={styles.chipText}>{b.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <ExerciseCard exercise={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={32} color={colors.muted} />
            <Text style={styles.emptyText}>
              Nessun esercizio trovato per questo filtro.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        testID="open-builder-fab"
        onPress={() => router.push("/builder")}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
        <Text style={styles.fabText}>Crea Allenamento</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: {
    color: colors.onSurface,
    fontSize: typography.display,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: { color: colors.muted, fontSize: typography.lg, marginTop: 4 },
  filters: { gap: spacing.sm, paddingBottom: spacing.md },
  chipRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  chip: {
    flexShrink: 0,
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipText: { color: colors.onSurfaceSecondary, fontSize: typography.base },
  chipTextActive: { color: colors.surface, fontWeight: "700" },
  dot: { width: 10, height: 10, borderRadius: 5 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 140 },
  empty: { alignItems: "center", padding: spacing.xl, gap: spacing.sm },
  emptyText: { color: colors.muted },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg + 70,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: colors.brand,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: colors.surface,
    fontWeight: "700",
    fontSize: typography.base,
  },
});
