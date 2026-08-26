import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  cancelAnimation,
} from "react-native-reanimated";
import { colors, radius, spacing, typography } from "@/src/theme";

type Props = {
  bpm: number | null;
  compact?: boolean;
};

export const HeartRateDisplay = React.memo(function HeartRateDisplay({
  bpm,
  compact = false,
}: Props) {
  const scale = useSharedValue(1);
  const active = bpm !== null;

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withTiming(1.25, { duration: 500 }),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 200 });
    }
    return () => cancelAnimation(scale);
  }, [active, scale]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      testID="heart-rate-display"
      style={[styles.container, compact && styles.compact]}
    >
      <Animated.View style={aStyle}>
        <Ionicons
          name="heart"
          size={compact ? 18 : 22}
          color={active ? colors.error : colors.muted}
        />
      </Animated.View>
      <Text style={[styles.value, compact && styles.valueCompact]}>
        {bpm ?? "–"}
      </Text>
      <Text style={styles.unit}>BPM</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  compact: { paddingVertical: 4 },
  value: {
    color: colors.onSurface,
    fontSize: typography.xxl,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  valueCompact: { fontSize: typography.lg },
  unit: { color: colors.muted, fontSize: typography.sm, letterSpacing: 1 },
});
