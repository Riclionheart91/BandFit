import * as Calendar from "expo-calendar";
import { Platform } from "react-native";

const CALENDAR_TITLE = "Workouts";

async function requestPermission(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

async function getOrCreateWorkoutCalendar(): Promise<string | null> {
  const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const found = cals.find((c) => c.title === CALENDAR_TITLE);
  if (found) return found.id;

  const defaultSource =
    Platform.OS === "ios"
      ? cals.find((c) => c.source && c.source.name === "iCloud")?.source ??
        cals[0]?.source
      : { isLocalAccount: true, name: "Workouts" };

  if (!defaultSource) return null;

  const id = await Calendar.createCalendarAsync({
    title: CALENDAR_TITLE,
    color: "#FF3B30",
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: Platform.OS === "ios" ? (defaultSource as any).id : undefined,
    source: defaultSource as any,
    name: CALENDAR_TITLE,
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  return id;
}

export async function logWorkoutToCalendar(opts: {
  title: string;
  startDate: Date;
  endDate: Date;
  exercises: string[];
}): Promise<string | null> {
  try {
    const granted = await requestPermission();
    if (!granted) return null;
    const calId = await getOrCreateWorkoutCalendar();
    if (!calId) return null;
    const notes = opts.exercises.map((n, i) => `${i + 1}. ${n}`).join("\n");
    const eventId = await Calendar.createEventAsync(calId, {
      title: opts.title,
      startDate: opts.startDate,
      endDate: opts.endDate,
      notes,
    });
    return eventId;
  } catch (e) {
    console.warn("[Calendar] log failed", e);
    return null;
  }
}
