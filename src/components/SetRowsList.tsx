import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  bandHex,
  bandLabel,
  colors,
  radius,
  spacing,
  typography,
  type BandColor,
} from "@/src/theme";
import type { SetLog } from "@/src/services/storage";

type Props = {
  totalSets: number;
  currentSetIndex: number;
  /** "active": la serie corrente si può chiudere. "rest": è la prossima, ancora in attesa. */
  phase: "active" | "rest";
  /** Riscaldamento: assente, in corso o già fatto (con il suo log). */
  warmup: "none" | "current" | "done";
  warmupLog?: SetLog;
  /** Riscaldamento dell'ultima volta. */
  previousWarmup?: SetLog | null;
  /** Serie già chiuse di questo esercizio. */
  logs: SetLog[];
  /** Ripetizioni previste per le serie di lavoro (mostrate sulle righe ancora da fare). */
  targetReps: number;
  /** Ultima volta, per ogni serie (null se non c'è). */
  previousFor: (setIndex: number) => SetLog | null;
  currentReps: number;
  currentBand: BandColor;
  bandChoices: BandColor[];
  onRepsChange: (reps: number) => void;
  onBandChange: (band: BandColor) => void;
  onComplete: () => void;
  /** Correzione di una serie già chiusa. */
  onEditLogged: (setIndex: number, patch: { reps?: number; band?: BandColor }) => void;
};

const shortBand = (b: BandColor) => bandLabel[b].split(" ")[0].toLowerCase();

export function SetRowsList(p: Props) {
  const rows = Array.from({ length: p.totalSets }, (_, i) => i);
  return (
    <View testID="set-rows" style={styles.wrap}>
      <View style={styles.headRow}>
        <Text style={[styles.head, styles.cSet]}>Serie</Text>
        <Text style={[styles.head, styles.cPrev]}>Precedente</Text>
        <Text style={[styles.head, styles.cReps]}>Reps</Text>
        <Text style={[styles.head, styles.cBand]}>Banda</Text>
        <View style={styles.cDone} />
      </View>

      {p.warmup !== "none" && (
        <View
          testID="set-row-warmup"
          style={[styles.row, p.warmup === "done" ? styles.rowDone : styles.rowCurrent]}
        >
          <Text style={[styles.cell, styles.cSet, { color: colors.warning }]}>R</Text>
          <Text style={[styles.cellMuted, styles.cPrev]} numberOfLines={1}>
            {p.previousWarmup ? `${p.previousWarmup.reps} · ${shortBand(p.previousWarmup.band)}` : "—"}
          </Text>
          {p.warmup === "done" && p.warmupLog ? (
            <>
              <Text style={[styles.cell, styles.cReps, { textAlign: "center" }]}>{p.warmupLog.reps}</Text>
              <View style={[styles.cBand, styles.dots]}>
                <View style={[styles.dot, { backgroundColor: bandHex[p.warmupLog.band], opacity: 1 }]} />
              </View>
              <View style={styles.cDone}>
                <Ionicons name="checkmark-circle" size={26} color={colors.success} />
              </View>
            </>
          ) : (
            <>
              <Stepper value={p.currentReps} onChange={p.onRepsChange} testID="set-row-warmup-reps" />
              <BandDots value={p.currentBand} choices={p.bandChoices} onChange={p.onBandChange} />
              <Pressable
                testID="set-row-complete"
                disabled={p.phase !== "active"}
                onPress={p.onComplete}
                style={[styles.cDone, styles.doneBtn, p.phase !== "active" && { opacity: 0.35 }]}
              >
                <Ionicons name="checkmark" size={20} color={colors.surface} />
              </Pressable>
            </>
          )}
        </View>
      )}

      {rows.map((i) => {
        const done = p.logs.find((l) => !l.warmup && l.setIndex === i);
        const isCurrent = !done && p.warmup !== "current" && i === p.currentSetIndex;
        const prev = p.previousFor(i);
        const prevText = prev ? `${prev.reps} · ${shortBand(prev.band)}` : "—";

        if (done) {
          return (
            <View key={i} testID={`set-row-${i}`} style={[styles.row, styles.rowDone]}>
              <Text style={[styles.cell, styles.cSet]}>{i + 1}</Text>
              <Text style={[styles.cellMuted, styles.cPrev]} numberOfLines={1}>
                {prevText}
              </Text>
              <Stepper
                value={done.reps}
                onChange={(v) => p.onEditLogged(i, { reps: v })}
                testID={`set-row-${i}-reps`}
              />
              <BandDots
                value={done.band}
                choices={p.bandChoices}
                onChange={(b) => p.onEditLogged(i, { band: b })}
              />
              <View style={styles.cDone}>
                <Ionicons name="checkmark-circle" size={26} color={colors.success} />
              </View>
            </View>
          );
        }

        if (isCurrent) {
          const canComplete = p.phase === "active";
          return (
            <View key={i} testID={`set-row-${i}`} style={[styles.row, styles.rowCurrent]}>
              <Text style={[styles.cell, styles.cSet]}>{i + 1}</Text>
              <Text style={[styles.cellMuted, styles.cPrev]} numberOfLines={1}>
                {prevText}
              </Text>
              <Stepper
                value={p.currentReps}
                onChange={p.onRepsChange}
                testID={`set-row-${i}-reps`}
              />
              <BandDots value={p.currentBand} choices={p.bandChoices} onChange={p.onBandChange} />
              <Pressable
                testID="set-row-complete"
                disabled={!canComplete}
                onPress={p.onComplete}
                style={[styles.cDone, styles.doneBtn, !canComplete && { opacity: 0.35 }]}
              >
                <Ionicons name="checkmark" size={20} color={colors.surface} />
              </Pressable>
            </View>
          );
        }

        return (
          <View key={i} testID={`set-row-${i}`} style={[styles.row, styles.rowTodo]}>
            <Text style={[styles.cellMuted, styles.cSet]}>{i + 1}</Text>
            <Text style={[styles.cellMuted, styles.cPrev]} numberOfLines={1}>
              {prevText}
            </Text>
            <Text style={[styles.cellMuted, styles.cReps, { textAlign: "center" }]}>
              {p.targetReps}
            </Text>
            <View style={styles.cBand} />
            <View style={styles.cDone} />
          </View>
        );
      })}
    </View>
  );
}

function Stepper({
  value,
  onChange,
  testID,
}: {
  value: number;
  onChange: (v: number) => void;
  testID?: string;
}) {
  return (
    <View style={[styles.cReps, styles.stepper]}>
      <Pressable hitSlop={8} style={styles.stepBtn} onPress={() => onChange(Math.max(0, value - 1))}>
        <Ionicons name="remove" size={16} color={colors.onSurface} />
      </Pressable>
      <Text testID={testID} style={styles.stepValue}>
        {value}
      </Text>
      <Pressable hitSlop={8} style={styles.stepBtn} onPress={() => onChange(Math.min(99, value + 1))}>
        <Ionicons name="add" size={16} color={colors.onSurface} />
      </Pressable>
    </View>
  );
}

function BandDots({
  value,
  choices,
  onChange,
}: {
  value: BandColor;
  choices: BandColor[];
  onChange: (b: BandColor) => void;
}) {
  return (
    <View style={[styles.cBand, styles.dots]}>
      {choices.map((b) => (
        <Pressable
          key={b}
          hitSlop={4}
          accessibilityLabel={bandLabel[b]}
          testID={`band-${b}`}
          onPress={() => onChange(b)}
          style={[
            styles.dot,
            { backgroundColor: bandHex[b] },
            value === b && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", paddingHorizontal: spacing.lg, gap: spacing.xs },
  headRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm },
  head: { color: colors.muted, fontSize: typography.sm, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  rowDone: { backgroundColor: colors.surfaceSecondary },
  rowCurrent: { backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.brand },
  rowTodo: { opacity: 0.6 },
  cell: { color: colors.onSurface, fontSize: typography.lg, fontWeight: "700" },
  cellMuted: { color: colors.muted, fontSize: typography.base },
  cSet: { width: 40 },
  cPrev: { flex: 1.1, paddingRight: spacing.xs },
  cReps: { flex: 1.2 },
  cBand: { flex: 1.5 },
  cDone: { width: 40, alignItems: "center", justifyContent: "center" },
  doneBtn: {
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
  },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    color: colors.onSurface,
    fontSize: typography.lg,
    fontWeight: "800",
    minWidth: 24,
    textAlign: "center",
  },
  dots: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  dot: { width: 18, height: 18, borderRadius: radius.pill, opacity: 0.45 },
  dotActive: { opacity: 1, borderWidth: 2, borderColor: colors.onSurface },
});
