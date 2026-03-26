# Phase 0 - API 필드 매핑 표 (초안)

작성일: 2026-03-26
기준: NEIS Open API의 대표 응답 구조를 내부 UI 모델로 매핑하기 위한 초기 초안.

## 1) 학교 기본 정보 매핑 (SchoolInfo)

| UI 필드 | NEIS 원본 필드(예상) | 설명 |
|---|---|---|
| officeCode | `ATPT_OFCDC_SC_CODE` | 시도교육청 코드 |
| officeName | `ATPT_OFCDC_SC_NM` | 시도교육청명 |
| schoolCode | `SD_SCHUL_CODE` | 표준학교코드 |
| schoolName | `SCHUL_NM` | 학교명 |
| schoolType | `SCHUL_KND_SC_NM` | 학교종류명 |
| orgType | `FOND_SC_NM` | 설립구분 |
| regionName | `LCTN_SC_NM` | 지역명 |
| addressRoad | `ORG_RDNMA` | 도로명 주소 |
| addressJibun | `ORG_RDNDA` | 지번 주소 |
| tel | `ORG_TELNO` | 대표 전화 |
| homepage | `HMPG_ADRES` | 홈페이지 주소 |
| coeduType | `COEDU_SC_NM` | 남녀공학 구분 |

## 2) 급식 정보 매핑 (MealInfo)

| UI 필드 | NEIS 원본 필드(예상) | 설명 |
|---|---|---|
| mealDate | `MLSV_YMD` | 급식일자(YYYYMMDD) |
| mealType | `MMEAL_SC_NM` | 급식종류(중식 등) |
| menuRaw | `DDISH_NM` | 메뉴 원문(HTML/줄바꿈 포함 가능) |
| calorie | `CAL_INFO` | 열량 정보 |
| nutrition | `NTR_INFO` | 영양 정보 |
| origin | `ORPLC_INFO` | 원산지 정보 |

## 3) 시간표 정보 매핑 (TimetableInfo)

| UI 필드 | NEIS 원본 필드(예상) | 설명 |
|---|---|---|
| grade | `GRADE` | 학년 |
| classNo | `CLASS_NM` | 학급 |
| period | `PERIO` | 교시 |
| subject | `ITRT_CNTNT` | 교과 내용 |
| date | `ALL_TI_YMD` 또는 API별 날짜 필드 | 시간표 기준일 |
| schoolTypeKey | 엔드포인트 구분값 | 초/중/고 API 분기 키 |

## 4) 내부 공통 모델 제안

| 내부 모델 | 필드 |
|---|---|
| `SchoolSummary` | `schoolKey, officeCode, schoolCode, schoolName, schoolType, addressRoad, tel` |
| `SchoolDetail` | `schoolSummary + orgType, homepage, coeduType, addressJibun` |
| `MealItem` | `mealDate, mealType, menuLines, calorie, nutrition, origin` |
| `TimetableItem` | `date, grade, classNo, period, subject` |

## 5) 키 생성 규칙(초안)

- `schoolKey = {ATPT_OFCDC_SC_CODE}-{SD_SCHUL_CODE}`
- 상세 라우트 파라미터로 `schoolKey`를 사용하고, 필요 시 쿼리로 `schoolName`을 보조 전달한다.

## 6) 확인 필요 항목

- 급식 응답의 메뉴 구분자(`br`, 개행) 정규화 방식 확정 필요
- 시간표 API는 학교급별 엔드포인트가 달라 실제 필드 차이 확인 필요
- 지도 표시는 주소 기반 검색과 좌표 기반 표시 중 실제 데이터 안정성이 높은 방식으로 확정 필요
