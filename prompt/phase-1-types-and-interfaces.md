# Phase 1 - 타입/인터페이스 설계 문서

작성일: 2026-03-26
목표: NEIS 응답 타입과 내부 UI 타입을 분리하고 탭별 모델을 정리한다.

## 1) 핵심 타입 정의

```ts
export type ThemeMode = 'light' | 'dark' | 'system';

export type SchoolKey = `${string}-${string}`; // {officeCode}-{schoolCode}

export interface SchoolSummary {
  schoolKey: SchoolKey;
  officeCode: string;
  officeName: string;
  schoolCode: string;
  schoolName: string;
  schoolType: string;
  addressRoad: string;
  tel?: string;
}

export interface SchoolDetail extends SchoolSummary {
  orgType?: string;
  regionName?: string;
  homepage?: string;
  addressJibun?: string;
  coeduType?: string;
  lat?: number;
  lng?: number;
}

export interface MealItem {
  mealDate: string; // YYYY-MM-DD
  mealType: string;
  menuLines: string[];
  calorie?: string;
  nutrition?: string;
  origin?: string;
}

export interface TimetableItem {
  date: string; // YYYY-MM-DD
  grade: number;
  classNo: number;
  period: number;
  subject: string;
}
```

## 2) 검색/상세 요청 타입

```ts
export interface SchoolSearchParams {
  officeCode: string;
  schoolName: string;
  page?: number;
  pageSize?: number;
}

export interface MealQueryParams {
  officeCode: string;
  schoolCode: string;
  fromYmd: string; // YYYYMMDD
  toYmd: string;   // YYYYMMDD
}

export interface TimetableQueryParams {
  officeCode: string;
  schoolCode: string;
  schoolLevel: 'elementary' | 'middle' | 'high';
  grade: number;
  classNo: number;
  fromYmd: string;
  toYmd: string;
}
```

## 3) 지도/길찾기/거리 타입

```ts
export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface RouteDistanceInfo {
  from?: GeoPoint;
  to: GeoPoint;
  distanceMeters?: number;
  distanceText?: string;
  canNavigate: boolean;
}

export interface RouteLinkPayload {
  schoolName: string;
  lat?: number;
  lng?: number;
  addressRoad?: string;
}
```

## 4) 즐겨찾기/최근조회 타입

```ts
export interface FavoriteSchool {
  schoolKey: SchoolKey;
  schoolName: string;
  officeName: string;
  schoolType?: string;
  updatedAt: string; // ISO
}

export interface RecentSchool {
  schoolKey: SchoolKey;
  schoolName: string;
  officeName: string;
  viewedAt: string; // ISO
}
```

## 5) API 응답 래퍼 타입

```ts
export interface NeisResultHead {
  list_total_count?: number;
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

export interface NeisRowResponse<T> {
  head?: NeisResultHead[];
  row?: T[];
}

export interface NeisApiEnvelope<T> {
  [resourceName: string]: NeisRowResponse<T>[];
}
```

## 6) UI 상태 타입

```ts
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data?: T;
  errorMessage?: string;
}
```

## 7) 타입 설계 원칙

- NEIS 원본 타입과 UI 타입을 직접 혼합하지 않는다.
- 화면은 항상 내부 타입(`SchoolDetail`, `MealItem`, `TimetableItem`)만 사용한다.
- 로컬 저장 데이터(즐겨찾기/최근조회)는 버전 필드를 추가할 수 있게 확장 여지를 둔다.
