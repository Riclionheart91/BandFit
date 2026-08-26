import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, typography } from "@/src/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  color?: string;
  primaryText: string;
  secondaryText?: string;
  primarySize?: number;
};

export const Timer = React.memo(function Timer({
  size = 260,
  strokeWidth = 14,
  progress,
  color = colors.brand,
  primaryText,
  secondaryText,
  primarySize = typography.display,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const sv = useSharedValue(progress);

  useEffect(() => {
    sv.value = withTiming(progress, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, sv]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - Math.min(1, Math.max(0, sv.value))),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceTertiary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text
          testID="timer-primary"
          style={[styles.primary, { fontSize: primarySize }]}
        >
          {primaryText}
        </Text>
        {secondaryText ? (
          <Text style={styles.secondary}>{secondaryText}</Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    color: colors.onSurface,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  secondary: {
    color: colors.muted,
    fontSize: typography.lg,
    marginTop: 4,
    letterSpacing: 1,
  },
});
