import { FavoriteSchool, RecentSchool, ThemeMode } from "./types";

const THEME_KEY = "schoolApp:theme:v1";
const FAVORITES_KEY = "schoolApp:favorites:v1";
const RECENTS_KEY = "schoolApp:recents:v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage write failures
  }
}

export function getThemeMode(): ThemeMode {
  return readJson<ThemeMode>(THEME_KEY, "system");
}

export function setThemeMode(mode: ThemeMode) {
  writeJson(THEME_KEY, mode);
}

export function getFavorites() {
  return readJson<FavoriteSchool[]>(FAVORITES_KEY, []);
}

export function toggleFavorite(item: Omit<FavoriteSchool, "updatedAt">) {
  const current = getFavorites();
  const found = current.some((value) => value.schoolKey === item.schoolKey);
  const next = found
    ? current.filter((value) => value.schoolKey !== item.schoolKey)
    : [{ ...item, updatedAt: new Date().toISOString() }, ...current];
  writeJson(FAVORITES_KEY, next);
  return next;
}

export function isFavorite(schoolKey: string) {
  return getFavorites().some((value) => value.schoolKey === schoolKey);
}

export function getRecents() {
  return readJson<RecentSchool[]>(RECENTS_KEY, []);
}

export function pushRecent(item: Omit<RecentSchool, "viewedAt">) {
  const current = getRecents().filter((value) => value.schoolKey !== item.schoolKey);
  const next = [{ ...item, viewedAt: new Date().toISOString() }, ...current].slice(0, 10);
  writeJson(RECENTS_KEY, next);
  return next;
}
