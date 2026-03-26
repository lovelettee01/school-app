import { SchoolLevel } from "./types";

/**
 * 학교를 고유하게 식별하기 위한 키 생성.
 *
 * @param officeCode 시도교육청 코드
 * @param schoolCode 표준 학교 코드
 * @returns `{officeCode}-{schoolCode}` 형식 문자열
 */
export function createSchoolKey(officeCode: string, schoolCode: string) {
  return `${officeCode}-${schoolCode}`;
}

/**
 * 상세 라우트 파라미터를 office/school 코드로 분해.
 *
 * @param schoolKey 경로 파라미터
 * @returns 파싱 성공 시 코드 객체, 실패 시 null
 */
export function parseSchoolKey(schoolKey: string) {
  const [officeCode, schoolCode] = schoolKey.split("-");
  if (!officeCode || !schoolCode) {
    return null;
  }
  return { officeCode, schoolCode };
}

/** `YYYYMMDD` -> `YYYY-MM-DD` 변환 */
export function normalizeYmd(ymd: string) {
  if (!/^\d{8}$/.test(ymd)) {
    return ymd;
  }
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

/** Date 객체를 `YYYYMMDD` 문자열로 변환 */
export function toYmd(value: Date) {
  const y = value.getFullYear();
  const m = `${value.getMonth() + 1}`.padStart(2, "0");
  const d = `${value.getDate()}`.padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * 학교종류명 텍스트를 기반으로 시간표 API 학교급을 추론.
 * 기본값은 중학교(middle)로 둔다.
 */
export function detectSchoolLevel(schoolType: string): SchoolLevel {
  if (schoolType.includes("초등")) {
    return "elementary";
  }
  if (schoolType.includes("고등")) {
    return "high";
  }
  return "middle";
}

/** 기준 날짜가 포함된 주의 월요일 계산 */
export function startOfWeek(date: Date) {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

/** 기준 날짜가 포함된 주의 금요일 계산 */
export function endOfWeek(date: Date) {
  const value = startOfWeek(date);
  value.setDate(value.getDate() + 4);
  return value;
}

/** 카카오맵 검색 링크 생성 */
export function getKakaoRouteUrl(name: string, address: string) {
  const keyword = encodeURIComponent(name || address);
  return `https://map.kakao.com/link/search/${keyword}`;
}

/**
 * 두 좌표 간 직선거리(Haversine) 계산.
 *
 * @returns 거리(m)
 */
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

/** 거리값(m)을 사람이 읽기 쉬운 단위로 포맷 */
export function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
