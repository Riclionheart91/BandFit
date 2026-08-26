import { Dimensions, ScaledSize } from "react-native";
import { brand } from "@/src/config";

export type ExternalListener = (isExternal: boolean) => void;

function isDesktop(screen: ScaledSize): boolean {
  return screen.width >= brand.breakpoints.desktop;
}

export function subscribeExternalDisplay(cb: ExternalListener): () => void {
  cb(isDesktop(Dimensions.get("window")));
  const sub = Dimensions.addEventListener("change", ({ window }) => {
    cb(isDesktop(window));
  });
  return () => sub.remove();
}
