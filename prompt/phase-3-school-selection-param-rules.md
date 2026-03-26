# Phase 3 - 학교 선택 파라미터 전달 규칙 문서

작성일: 2026-03-26
목표: 검색 결과에서 상세 페이지로 이동할 때 사용하는 식별자/쿼리 규칙을 확정한다.

## 1) 라우트 규칙

- 상세 경로: `/school/[schoolKey]`
- `schoolKey` 포맷: `{officeCode}-{schoolCode}`
- 예시: `/school/B10-7010569`

## 2) 최소 전달 파라미터

- Path params
- `schoolKey` (필수)

- Query params (선택)
- `tab`: `info | meal | timetable`
- `schoolName`: UI 초기 제목 표시 보조(옵션)

## 3) 파라미터 생성 규칙

- `schoolKey`
- `officeCode`, `schoolCode`를 `-`로 결합
- 공백/대소문자 정규화 적용

- `tab`
- 미지정 시 `info` 기본값
- 허용 값 외 입력은 `info`로 강제 보정

- `schoolName`
- URL 인코딩 적용
- 신뢰하지 않고 화면 보조값으로만 사용

## 4) 상세 진입 후 해석 규칙

1. Path의 `schoolKey`를 분해하여 `officeCode`, `schoolCode`를 복원한다.
2. 복원 실패 시 `400 성격` UI 오류 처리(잘못된 주소 안내).
3. 복원 성공 시 API로 학교 상세를 재조회해 신뢰 데이터로 렌더링한다.

## 5) 예외 처리 규칙

- `schoolKey` 형식 오류
- 오류 페이지 또는 인라인 오류 상태 표시
- 홈으로 이동 버튼 제공

- API 조회 0건
- "학교 정보를 찾을 수 없습니다" 메시지 표시

- 탭 쿼리 손상
- 기본 탭 `info`로 fallback

## 6) 보안/무결성 원칙

- 쿼리 문자열 값은 서버/클라이언트 모두에서 검증한다.
- `schoolName` 등 보조 파라미터는 API 응답으로 덮어쓴다.
- 경로 인젝션/스크립트 입력은 escape 처리한다.

## 7) 샘플 URL

- 기본 진입
- `/school/B10-7010569`

- 급식 탭 바로 진입
- `/school/B10-7010569?tab=meal`

- 시간표 탭 + 보조 이름
- `/school/B10-7010569?tab=timetable&schoolName=%EC%84%9C%EC%9A%B8%EA%B3%A0`
