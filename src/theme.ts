// Design tokens derived from /app/design_guidelines.json (7 Dark-First Utility)
export const colors = {
  surface: "#000000",
  onSurface: "#FFFFFF",
  surfaceSecondary: "#1C1C1E",
  onSurfaceSecondary: "#EBEBF5",
  surfaceTertiary: "#2C2C2E",
  onSurfaceTertiary: "#D1D1D6",
  brand: "#34C759",
  brandSecondary: "#32ADE6",
  success: "#34C759",
  warning: "#FFD700",
  error: "#FF3B30",
  border: "#38383A",
  borderStrong: "#48484A",
  divider: "#2C2C2E",
  muted: "#8E8E93",
  bandYellow: "#FFD700",
  bandRed: "#FF3B30",
  bandBlack: "#3A3A3C",
  bandPurple: "#BF5AF2",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
  hero: 80,
  mega: 120,
} as const;

export type BandColor = "yellow" | "red" | "black" | "purple";

export const bandHex: Record<BandColor, string> = {
  yellow: colors.bandYellow,
  red: colors.bandRed,
  black: colors.bandBlack,
  purple: colors.bandPurple,
};

export const bandLabel: Record<BandColor, string> = {
  yellow: "Gialla 2–7kg",
  red: "Rossa 7–16kg",
  black: "Nera 11–30kg",
  purple: "Viola 16–38kg",
};

export type Category = "full_body" | "upper" | "core" | "lower";

export const categoryLabel: Record<Category, string> = {
  full_body: "Corpo Libero",
  upper: "Parte Superiore",
  core: "Core",
  lower: "Parte Inferiore",
};

export const categoryIcon: Record<Category, string> = {
  full_body: "body",
  upper: "barbell",
  core: "flame",
  lower: "walk",
};
