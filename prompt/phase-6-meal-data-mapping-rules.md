# Phase 6 - 급식 데이터 매핑 규칙 문서

작성일: 2026-03-26
목표: NEIS 급식 응답을 UI 모델로 안정적으로 변환하는 규칙을 확정한다.

## 1) 원본 -> 내부 필드 매핑

| 원본 필드 | 내부 필드 | 규칙 |
|---|---|---|
| `MLSV_YMD` | `mealDate` | `YYYYMMDD` -> `YYYY-MM-DD` 변환 |
| `MMEAL_SC_NM` | `mealType` | 공백 trim, 빈값이면 `급식` 기본값 |
| `DDISH_NM` | `menuLines` | HTML break 분리 + 정제 |
| `CAL_INFO` | `calorie` | 원문 유지 |
| `NTR_INFO` | `nutrition` | 원문 유지(필요 시 줄바꿈 정규화) |
| `ORPLC_INFO` | `origin` | 원문 유지 |

## 2) 메뉴 문자열 파싱 규칙

입력 예: `쌀밥<br/>미역국(5.6)<br/>불고기(10.13)`

규칙:
1. `<br>`, `<br/>`, `<BR>`를 줄바꿈으로 통일
2. HTML 엔티티 제거/디코딩
3. 빈 줄 제거
4. 좌우 공백 제거
5. 결과를 `string[]`로 저장

## 3) 알레르기 정보 처리

- 공통: 별도로 전체 알레르기 항목을 상수 하여 화면에 토글하여 확인 있는 레이어 형태의 팝업 구성
- 원칙: 식단명 내 괄호 숫자를 추출 가능하게 유지
- 기본 표시: 메뉴 원문 유지 + 숫자 강조(후속)
- 매핑 단계에서는 식단 텍스트를 손상시키지 않는다.

## 4) 날짜/기간 규칙

- 기본 조회일: 클라이언트 로컬 오늘(`YYYYMMDD`)
- 기간 조회 시 `fromYmd <= toYmd` 검증 필수
- 조회 최대 범위: 7일(초안)

## 5) 빈값/오류 매핑 규칙

- `row` 없음 또는 0건 -> `EMPTY`
- 네트워크 실패 -> `NETWORK_ERROR`
- 타임아웃 -> `TIMEOUT`
- RESULT 오류코드 -> `UPSTREAM_ERROR`

UI 매핑:
- `EMPTY` -> 빈 상태 컴포넌트
- 기타 오류 -> 오류 컴포넌트 + 재시도

## 6) 내부 타입 예시

```ts
interface MealItem {
  mealDate: string;      // YYYY-MM-DD
  mealType: string;      // 중식/석식 등
  menuLines: string[];   // 파싱 완료 메뉴
  calorie?: string;
  nutrition?: string;
  origin?: string;
}
```

## 7) 캐시 키 규칙

- `meal:{officeCode}:{schoolCode}:{fromYmd}:{toYmd}`
- 동일 키 재조회 시 캐시 우선

## 8) 품질 체크리스트

- [ ] HTML break 변형 케이스 모두 파싱되는가
- [ ] 공백/빈 문자열 메뉴가 제거되는가
- [ ] 날짜 변환 형식이 일관적인가
- [ ] 주말/공휴일 빈응답이 정상 처리되는가
- [ ] 다크모드에서 긴 메뉴 줄바꿈 가독성이 유지되는가
