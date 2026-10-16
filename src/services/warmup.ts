import type { BandColor } from "@/src/theme";

/** Bande dalla più leggera alla più pesante. */
const BAND_ORDER: BandColor[] = ["yellow", "red", "black", "purple"];

/** Pausa dopo la serie di riscaldamento, più breve di quella tra le serie di lavoro. */
export const WARMUP_REST_SECONDS = 15;

/** Riscaldamento: circa metà delle ripetizioni previste (minimo 1). */
export function warmupReps(workingReps: number): number {
  return Math.max(1, Math.ceil(workingReps / 2));
}

/**
 * Banda per il riscaldamento: la più pesante tra quelle possedute che sia più leggera di quella
 * di lavoro. Se non esiste, si usa la stessa banda (il carico dimezzato lo dà il numero di reps).
 */
export function warmupBand(workingBand: BandColor, owned: BandColor[]): BandColor {
  const w = BAND_ORDER.indexOf(workingBand);
  const lighter = BAND_ORDER.filter((b, i) => i < w && owned.includes(b));
  return lighter.length ? lighter[lighter.length - 1] : workingBand;
}
