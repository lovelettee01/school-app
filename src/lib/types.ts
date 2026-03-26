/**
 * 프로젝트 전역 타입 정의 파일.
 *
 * - API 응답을 UI에서 다룰 수 있는 형태로 모델링
 * - 테마/학교/급식/시간표/사용자 저장 데이터 타입 통합 관리
 */

/** UI 테마 모드: 라이트/다크/시스템 기본값 */
export type ThemeMode = "light" | "dark" | "system";

/** 학교급 구분: 시간표 API 리소스 분기 기준 */
export type SchoolLevel = "elementary" | "middle" | "high";

/** 학교 검색/상세 공통 요약 모델 */
export type SchoolSummary = {
  schoolKey: string;
  officeCode: string;
  officeName: string;
  schoolCode: string;
  schoolName: string;
  schoolType: string;
  orgType: string;
  regionName: string;
  addressRoad: string;
  addressJibun: string;
  tel: string;
  homepage: string;
  coeduType: string;
};

/** 급식 아이템 모델 */
export type MealItem = {
  mealDate: string;
  mealType: string;
  menuLines: string[];
  calorie: string;
  nutrition: string;
  origin: string;
};

/** 시간표 아이템 모델 */
export type TimetableItem = {
  date: string;
  grade: number;
  classNo: number;
  period: number;
  subject: string;
};

/** 즐겨찾기 저장 모델(LocalStorage) */
export type FavoriteSchool = {
  schoolKey: string;
  schoolName: string;
  officeName: string;
  schoolType: string;
  updatedAt: string;
};

/** 최근 조회 저장 모델(LocalStorage) */
export type RecentSchool = {
  schoolKey: string;
  schoolName: string;
  officeName: string;
  viewedAt: string;
};
