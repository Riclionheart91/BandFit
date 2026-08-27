export const brand = {
  colors: {
    surface: "#000000",
    onSurface: "#FFFFFF",
    surfaceSecondary: "#1C1C1E",
    onSurfaceSecondary: "#EBEBF5",
    surfaceTertiary: "#2C2C2E",
    brand: "#34C759",
    brandSecondary: "#32ADE6",
    success: "#34C759",
    warning: "#FFD700",
    error: "#FF3B30",
    border: "#38383A",
    muted: "#8E8E93",
  },
  breakpoints: { mobile: 0, tablet: 768, desktop: 1024, tv: 1920 },
};

export const supabase = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  authRedirectUrl: process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ?? "https://your-user.github.io/BandFit/",
  tables: {
    sessions: "sessions",
    customWorkouts: "custom_workouts",
    weeklyPrograms: "weekly_programs",
  },
};

export const cdn = {
  baseUrl: process.env.EXPO_PUBLIC_CDN_BASE_URL ?? "https://cdn.bandfit.app/gifs/",
  extension: ".gif",
};

export const aiEngine = {
  programLength: 6,
  deloadWeek: 5,
  resetWeek: 6,
  rpeThreshold: 7,
  volumeIncreaseFactor: 0.1,
  deloadReductionFactor: 0.4,
  rest: { base: 45, short: 30, deload: 75 },
  caloriesPerMinute: 6,
  isometricHoldDuration: 20,
  exercisesPerSession: 5,
  frequencyToSplit: {
    2: ["upper", "lower"],
    3: ["upper", "lower", "core"],
    4: ["upper", "lower", "upper", "core"],
    5: ["upper", "lower", "core", "upper", "lower"],
  } as Record<number, string[]>,
};

export const audioCoach = {
  lang: "it-IT",
  rate: 1,
  pitch: 1,
  phrases: {
    workoutStart: "Iniziamo l'allenamento",
    exerciseChange: (name: string) => `Prossimo esercizio: ${name}`,
    setStart: "Inizia la serie",
    setComplete: "Serie completata",
    restStart: "Riposo",
    restEnd: "Riposo terminato, preparati",
    workoutDone: "Allenamento completato, ottimo lavoro",
  },
};

export const uiStrings = {
  common: { save: "Salva", cancel: "Annulla", close: "Chiudi", accept: "Accetto", loading: "Caricamento..." },
  profile: {
    title: "Profilo",
    loginGoogle: "Accedi con Google",
    logout: "Esci",
    localMode: "Modalità locale",
    cloudSynced: "Sincronizzato con il cloud",
    batterySaver: "Risparmio Batteria (blocca GIF a riposo)",
    weeklyProgramTitle: "Piano 6 Settimane",
    weeklyProgramWeek: "Settimana",
    weeklyProgramActive: "Attivo",
    weeklyProgramNone: "Nessun piano attivo",
    weeklyProgramStartToday: "Inizia l'allenamento di oggi",
    weeklyProgramGenerate: "Genera piano",
    weeklyProgramFrequency: "Frequenza settimanale",
    rpePrompt: "Quanto è stato intenso l'allenamento? (1-10)",
    rpeSkip: "Salta",
  },
  disclaimer: {
    title: "Avviso Medico",
    body: "Le informazioni fornite da questa applicazione non sostituiscono il parere medico. Consulta un professionista sanitario prima di iniziare qualsiasi programma di allenamento, specialmente in presenza di condizioni preesistenti.",
  },
};

export const legal = {
  disclaimerText: uiStrings.disclaimer.body,
  storageKeys: {
    disclaimerAccepted: "@rb/disclaimer_accepted",
    batterySaver: "@rb/battery_saver",
    weeklyProgram: "@rb/weekly_program",
    authUserId: "@rb/auth_user_id",
  },
};
