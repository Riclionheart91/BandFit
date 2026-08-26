import { Dimensions, ScaledSize } from "react-native";

/**
 * Detect external display via Dimensions change.
 *
 * Upgrade path: `react-native-external-display` exposes proper
 * UIScreen.screens callbacks; this lightweight stub is sufficient for MVP
 * — when the user mirrors / connects an external screen, the window
 * aspect ratio shifts dramatically (becomes landscape with wide ratio).
 */

export type ExternalListener = (isExternal: boolean) => void;

function isExternal(screen: ScaledSize): boolean {
  // Heuristic: aspect > 1.7 (wide landscape) AND width >= 1024 implies TV/monitor mirroring
  const aspect = screen.width / screen.height;
  return aspect > 1.7 && screen.width >= 1024;
}

export function subscribeExternalDisplay(cb: ExternalListener): () => void {
  // initial
  cb(isExternal(Dimensions.get("screen")));
  const sub = Dimensions.addEventListener("change", ({ screen }) => {
    cb(isExternal(screen));
  });
  return () => sub.remove();
}
