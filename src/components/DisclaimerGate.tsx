import React from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { useWorkout } from "@/src/context/WorkoutContext";
import { uiStrings } from "@/src/config";
import { colors, radius, spacing, typography } from "@/src/theme";

export default function DisclaimerGate() {
  const { disclaimerAccepted, acceptDisclaimer } = useWorkout();
  if (disclaimerAccepted) return null;
  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{uiStrings.disclaimer.title}</Text>
          <Text style={styles.body}>{uiStrings.disclaimer.body}</Text>
          <Pressable style={styles.btn} onPress={acceptDisclaimer} testID="disclaimer-accept">
            <Text style={styles.btnText}>{uiStrings.common.accept}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center", padding: spacing.lg },
  card: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.xl, maxWidth: 480, gap: spacing.md },
  title: { color: colors.onSurface, fontSize: typography.xl, fontWeight: "800" },
  body: { color: colors.onSurfaceSecondary, fontSize: typography.base, lineHeight: 20 },
  btn: { backgroundColor: colors.brand, paddingVertical: spacing.md, borderRadius: radius.pill, alignItems: "center" },
  btnText: { color: colors.surface, fontWeight: "800", fontSize: typography.lg },
});
