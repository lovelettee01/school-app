# Phase 7 - 학교급별 API 분기 표

작성일: 2026-03-26
목표: 학교급(초/중/고)에 따라 NEIS 시간표 API를 분기하는 규칙을 확정한다.

## 1) 분기 기준

- 입력: `schoolLevel`
- 값: `elementary`, `middle`, `high`
- 분기 대상: 호출 리소스명(엔드포인트)

## 2) API 분기 표(초안)

| schoolLevel | NEIS 리소스(예상) | 설명 |
|---|---|---|
| elementary | `elsTimetable` | 초등학교 시간표 조회 |
| middle | `misTimetable` | 중학교 시간표 조회 |
| high | `hisTimetable` | 고등학교 시간표 조회 |

주의: 실제 운영 전 NEIS 문서 기준 리소스명/필드명 재검증 필요.

## 3) 공통 요청 파라미터

- `ATPT_OFCDC_SC_CODE` (시도교육청 코드)
- `SD_SCHUL_CODE` (학교 코드)
- `GRADE` (학년)
- `CLASS_NM` (학급)
- `ALL_TI_YMD` 또는 기간 파라미터
- `KEY`, `Type=json`, `pIndex`, `pSize`

## 4) 내부 라우팅 함수 규칙

```ts
function resolveTimetableResource(level: 'elementary' | 'middle' | 'high') {
  if (level === 'elementary') return 'elsTimetable';
  if (level === 'middle') return 'misTimetable';
  return 'hisTimetable';
}
```

## 5) 응답 필드 표준화 규칙

| 원본 필드(예상) | 내부 필드 | 규칙 |
|---|---|---|
| `GRADE` | `grade` | number 변환 |
| `CLASS_NM` | `classNo` | number 변환 |
| `PERIO` | `period` | number 변환 |
| `ITRT_CNTNT` | `subject` | trim 후 빈값 보정 |
| `ALL_TI_YMD` | `date` | `YYYYMMDD` -> `YYYY-MM-DD` |

## 6) 오류/예외 분기

- 학교급 판별 실패
- fallback: `middle` 사용 금지
- 처리: `VALIDATION_ERROR` 반환 + 사용자 안내

- API 응답 없음
- `EMPTY` 상태로 처리

- 리소스 오류코드
- `UPSTREAM_ERROR` + 재시도 제공

## 7) 검증 체크리스트

- [ ] 학교급 판별 로직이 학교 유형값과 일치하는가
- [ ] 리소스별 필드명이 실제와 일치하는가
- [ ] 단일일/주간 조회 파라미터가 일관적으로 동작하는가
- [ ] 교시 정렬이 숫자 기준으로 안정적인가
- [ ] 초/중/고 샘플 학교로 각각 조회 검증했는가
