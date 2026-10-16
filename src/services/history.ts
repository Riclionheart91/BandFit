import type { Session, SetLog } from "@/src/services/storage";

/**
 * Ultima serie registrata per lo stesso esercizio e lo stesso numero di serie, nella sessione più recente
 * che la contiene. `sessions` è ordinato dalla più recente (come lo restituisce saveSession).
 */
export function previousSetLog(
  sessions: Session[],
  exerciseId: string,
  setIndex: number,
  warmup = false
): SetLog | null {
  for (const s of sessions) {
    const ex = s.exercises?.find((e) => e.exerciseId === exerciseId && e.setLogs?.length);
    const log = ex?.setLogs?.find((l) => l.setIndex === setIndex && !!l.warmup === warmup);
    if (log) return log;
  }
  return null;
}

/**
 * Record: più ripetizioni di qualsiasi serie di lavoro precedente dello stesso esercizio con la stessa banda
 * (sessioni passate e serie già fatte in questa). Alla prima volta non c'è un termine di confronto, quindi false.
 */
export function isNewRecord(
  sessions: Session[],
  exerciseId: string,
  band: SetLog["band"],
  reps: number,
  doneThisSession: SetLog[]
): boolean {
  let best = -1;
  const consider = (l: SetLog) => {
    if (!l.warmup && l.band === band && !l.holdSeconds) best = Math.max(best, l.reps);
  };
  for (const s of sessions) {
    s.exercises?.forEach((e) => {
      if (e.exerciseId === exerciseId) e.setLogs?.forEach(consider);
    });
  }
  doneThisSession.forEach(consider);
  return best >= 0 && reps > best;
}
