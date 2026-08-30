import AsyncStorage from "@react-native-async-storage/async-storage";
import { getClient } from "@/src/services/cloudStorage";

const CACHE_KEY = "@rb/exercise_gifs_cache_v1";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, this data barely changes

type GifRow = { exercise_id: string; gif_url: string };
type GifMap = Record<string, string>;

let memoryCache: GifMap | null = null;

async function fetchFromSupabase(): Promise<GifMap> {
  const { data, error } = await getClient()
    .from("exercise_gifs")
    .select("exercise_id, gif_url");
  if (error || !data) return {};
  const map: GifMap = {};
  (data as GifRow[]).forEach((row) => {
    map[row.exercise_id] = row.gif_url;
  });
  return map;
}

export async function getExerciseGifMap(): Promise<GifMap> {
  if (memoryCache) return memoryCache;

  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { map: GifMap; fetchedAt: number };
      if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
        memoryCache = parsed.map;
        return parsed.map;
      }
    }
  } catch {}

  const map = await fetchFromSupabase();
  memoryCache = map;
  if (Object.keys(map).length > 0) {
    AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ map, fetchedAt: Date.now() })
    ).catch(() => {});
  }
  return map;
}
