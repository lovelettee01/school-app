import { FavoriteSchool, RecentSchool, ThemeMode } from "./types";

/**
 * LocalStorage 키 상수.
 * 키에 버전 정보를 포함해 추후 데이터 구조 변경 시 마이그레이션 가능성을 열어둔다.
 */
const THEME_KEY = "schoolApp:theme:v1";
const FAVORITES_KEY = "schoolApp:favorites:v1";
const RECENTS_KEY = "schoolApp:recents:v1";

/**
 * LocalStorage JSON 읽기 공통 함수.
 * 브라우저 환경이 아니거나 파싱 실패 시 fallback 반환.
 */
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

/**
 * LocalStorage JSON 쓰기 공통 함수.
 * 저장 실패는 사용자 UX를 막지 않기 위해 무시한다.
 */
function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 스토리지 제한/권한 문제 발생 시 조용히 무시
  }
}

/** 현재 저장된 테마 모드 조회 */
export function getThemeMode(): ThemeMode {
  return readJson<ThemeMode>(THEME_KEY, "system");
}

/** 테마 모드 저장 */
export function setThemeMode(mode: ThemeMode) {
  writeJson(THEME_KEY, mode);
}

/** 즐겨찾기 목록 조회 */
export function getFavorites() {
  return readJson<FavoriteSchool[]>(FAVORITES_KEY, []);
}

/**
 * 즐겨찾기 토글.
 * 이미 있으면 제거, 없으면 최신 시각(updatedAt)으로 목록 상단에 추가.
 */
export function toggleFavorite(item: Omit<FavoriteSchool, "updatedAt">) {
  const current = getFavorites();
  const found = current.some((value) => value.schoolKey === item.schoolKey);
  const next = found
    ? current.filter((value) => value.schoolKey !== item.schoolKey)
    : [{ ...item, updatedAt: new Date().toISOString() }, ...current];
  writeJson(FAVORITES_KEY, next);
  return next;
}

/** 특정 학교가 즐겨찾기인지 여부 반환 */
export function isFavorite(schoolKey: string) {
  return getFavorites().some((value) => value.schoolKey === schoolKey);
}

/** 최근 조회 목록 조회 */
export function getRecents() {
  return readJson<RecentSchool[]>(RECENTS_KEY, []);
}

/**
 * 최근 조회 추가.
 * 기존 중복 항목은 제거 후 맨 앞에 삽입하고, 최대 10개 유지.
 */
export function pushRecent(item: Omit<RecentSchool, "viewedAt">) {
  const current = getRecents().filter((value) => value.schoolKey !== item.schoolKey);
  const next = [{ ...item, viewedAt: new Date().toISOString() }, ...current].slice(0, 10);
  writeJson(RECENTS_KEY, next);
  return next;
}
