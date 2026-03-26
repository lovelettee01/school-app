import { SchoolLevel } from "./types";

export function createSchoolKey(officeCode: string, schoolCode: string) {
  return `${officeCode}-${schoolCode}`;
}

export function parseSchoolKey(schoolKey: string) {
  const [officeCode, schoolCode] = schoolKey.split("-");
  if (!officeCode || !schoolCode) {
    return null;
  }
  return { officeCode, schoolCode };
}

export function normalizeYmd(ymd: string) {
  if (!/^\d{8}$/.test(ymd)) {
    return ymd;
  }
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

export function toYmd(value: Date) {
  const y = value.getFullYear();
  const m = `${value.getMonth() + 1}`.padStart(2, "0");
  const d = `${value.getDate()}`.padStart(2, "0");
  return `${y}${m}${d}`;
}

export function detectSchoolLevel(schoolType: string): SchoolLevel {
  if (schoolType.includes("초")) {
    return "elementary";
  }
  if (schoolType.includes("고")) {
    return "high";
  }
  return "middle";
}

export function startOfWeek(date: Date) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

export function endOfWeek(date: Date) {
  const value = startOfWeek(date);
  value.setDate(value.getDate() + 4);
  return value;
}

export function getKakaoRouteUrl(name: string, address: string) {
  const keyword = encodeURIComponent(name || address);
  return `https://map.kakao.com/link/search/${keyword}`;
}

export function haversineDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earth * c);
}

export function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
