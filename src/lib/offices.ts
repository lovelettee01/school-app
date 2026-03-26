/**
 * 시도교육청 옵션 상수.
 *
 * 검색 화면 select 박스에서 그대로 렌더링하며,
 * code 값은 NEIS `ATPT_OFCDC_SC_CODE` 파라미터로 사용된다.
 */
export const OFFICE_OPTIONS = [
  { code: "B10", name: "서울특별시교육청" },
  { code: "C10", name: "부산광역시교육청" },
  { code: "D10", name: "대구광역시교육청" },
  { code: "E10", name: "인천광역시교육청" },
  { code: "F10", name: "광주광역시교육청" },
  { code: "G10", name: "대전광역시교육청" },
  { code: "H10", name: "울산광역시교육청" },
  { code: "I10", name: "세종특별자치시교육청" },
  { code: "J10", name: "경기도교육청" },
  { code: "K10", name: "강원특별자치도교육청" },
  { code: "M10", name: "충청북도교육청" },
  { code: "N10", name: "충청남도교육청" },
  { code: "P10", name: "전북특별자치도교육청" },
  { code: "Q10", name: "전라남도교육청" },
  { code: "R10", name: "경상북도교육청" },
  { code: "S10", name: "경상남도교육청" },
  { code: "T10", name: "제주특별자치도교육청" },
] as const;
