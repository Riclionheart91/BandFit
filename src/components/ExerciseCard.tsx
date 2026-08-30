import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  bandHex,
  bandLabel,
  categoryLabel,
  colors,
  radius,
  spacing,
  typography,
} from "@/src/theme";
import type { Exercise } from "@/src/data/exercises";

type Props = {
  exercise: Exercise;
  onPress?: () => void;
  rightSlot?: React.ReactNode;
  gifUrl?: string;
};

export const ExerciseCard = React.memo(function ExerciseCard({
  exercise,
  onPress,
  rightSlot,
  gifUrl,
}: Props) {
  const band = bandHex[exercise.band];
  return (
    <Pressable
      testID={`exercise-card-${exercise.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.iconWrap, { borderColor: band }]}>
        {gifUrl ? (
          <Image source={{ uri: gifUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <Ionicons name={exercise.icon as any} size={24} color={band} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {categoryLabel[exercise.category]}
            </Text>
          </View>
          <View style={[styles.bandDot, { backgroundColor: band }]} />
          <Text style={styles.bandText} numberOfLines={1}>
            {bandLabel[exercise.band]}
          </Text>
        </View>
      </View>
      {rightSlot ?? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.muted}
        />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  thumb: { width: "100%", height: "100%" },
  body: { flex: 1, gap: 4 },
  name: {
    fontSize: typography.lg,
    color: colors.onSurface,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: colors.surfaceTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagText: { fontSize: typography.sm, color: colors.onSurfaceTertiary },
  bandDot: { width: 8, height: 8, borderRadius: 4 },
  bandText: { fontSize: typography.sm, color: colors.muted },
});
