# Phase 2 - API 모듈 설계서

작성일: 2026-03-26
목표: NEIS API 호출 레이어, 공통 에러 처리, 응답 정규화 규칙을 확정한다.

## 1) 모듈 구조

- `src/lib/api/neis-client.ts`
- 공통 HTTP 래퍼
- 타임아웃/재시도/에러 표준화

- `src/lib/api/school-api.ts`
- 학교 목록/상세 조회

- `src/lib/api/meal-api.ts`
- 급식식단 조회

- `src/lib/api/timetable-api.ts`
- 시간표 조회(초/중/고 분기)

- `src/lib/mappers/*.ts`
- NEIS 원본 응답 -> 내부 ViewModel 변환

- `src/lib/validators/*.ts`
- 파라미터 검증

## 2) 공통 클라이언트 인터페이스

```ts
interface RequestOptions {
  resource: string;
  params: Record<string, string | number | undefined>;
  timeoutMs?: number;
  retries?: number;
}

interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: { totalCount?: number };
}

interface ApiFailure {
  ok: false;
  code: 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UPSTREAM_ERROR' | 'EMPTY';
  message: string;
  status?: number;
}

type ApiResult<T> = ApiSuccess<T> | ApiFailure;
```

## 3) API 함수 분리 계획

- 학교 조회
- `searchSchools(params)`
- `getSchoolDetail(officeCode, schoolCode)`

- 급식 조회
- `getMeals(params)`

- 시간표 조회
- `getTimetable(params)`
- `schoolLevel`에 따라 엔드포인트 라우팅

## 4) URL 파라미터 빌더 규칙

- 필수 공통 파라미터
- `KEY`, `Type=json`, `pIndex`, `pSize`

- 조회 파라미터 정규화
- 문자열은 `trim()` 후 빈 문자열 제거
- 날짜는 `YYYYMMDD` 8자리 검증
- 학년/학급은 양의 정수 검증

- 빌더 유틸
- `buildNeisQuery(params)`
- `toYmd(date: Date)`

## 5) 응답 정규화 규칙

- 성공 판단
- `row` 존재 + 길이 > 0 이면 success
- `row` 없음 + RESULT 성공 코드면 empty

- 에러 매핑
- 네트워크/타임아웃 -> `NETWORK_ERROR`/`TIMEOUT`
- RESULT 오류코드 -> `UPSTREAM_ERROR`
- 입력값 오류 -> `VALIDATION_ERROR`

- 매퍼 원칙
- 화면은 반드시 내부 타입만 받는다.
- 원본 필드 누락은 안전한 기본값으로 보정한다.

## 6) 캐시/재조회 정책

- 검색: 동일 파라미터 5분 캐시
- 상세: 학교키 기준 10분 캐시
- 급식: 날짜 범위 기준 5분 캐시
- 시간표: 학교+학년+학급+기간 기준 5분 캐시
- 탭 이동 시 동일 쿼리면 캐시 우선 사용

## 7) 공통 에러 처리 UX 연결

- `VALIDATION_ERROR` : 입력 필드 인라인 오류
- `EMPTY` : 빈 상태 컴포넌트
- `NETWORK_ERROR`, `TIMEOUT` : 재시도 버튼 노출
- `UPSTREAM_ERROR` : 서비스 장애 안내 문구 + 재시도

## 8) 길찾기/거리 계산 연계

- 지도 탭 API와 분리된 유틸로 처리
- 거리 계산은 `GeoLocation` 허용 시만 수행
- 길찾기는 카카오맵 URL 생성 함수로 구현
