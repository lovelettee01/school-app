# Phase 2 - 테마 동작 명세서

작성일: 2026-03-26
목표: 다크모드 토글과 시스템 연동, 저장 전략, 토큰 규칙을 확정한다.

## 1) 테마 모드 정의

- `light`: 라이트 고정
- `dark`: 다크 고정
- `system`: OS 선호 테마 동기화

## 2) 초기화 규칙

1. 로컬 저장값(`schoolApp:theme:v1`) 확인
2. 저장값이 없으면 `system` 적용
3. 렌더 직후 `document.documentElement`에 `data-theme` 반영

## 3) 토글 동작 규칙

- 권장 UI: 3상태 세그먼트 버튼(`라이트/다크/시스템`)
- 선택 즉시 화면 반영
- 선택값은 로컬스토리지에 저장
- `system` 모드에서는 OS 테마 변경 이벤트를 구독하여 반영

## 4) 접근성 규칙

- 토글은 키보드 포커스 가능
- `aria-label` 및 현재 상태(`aria-pressed` 또는 `aria-selected`) 제공
- 라이트/다크 모두 최소 텍스트 대비 기준 충족

## 5) 색상 토큰(초안)

```css
:root[data-theme='light'] {
  --bg: #f6f7fb;
  --surface: #ffffff;
  --surface-muted: #eef1f6;
  --text: #121417;
  --text-muted: #4a5565;
  --primary: #0b57d0;
  --primary-contrast: #ffffff;
  --border: #d9e0ea;
  --success: #14804a;
  --warning: #b56a00;
  --danger: #be123c;
}

:root[data-theme='dark'] {
  --bg: #0f131a;
  --surface: #151b24;
  --surface-muted: #1d2633;
  --text: #eef2f7;
  --text-muted: #a8b3c2;
  --primary: #5ba1ff;
  --primary-contrast: #081223;
  --border: #2d394a;
  --success: #4dd08a;
  --warning: #ffb454;
  --danger: #ff6b8b;
}
```

## 6) 컴포넌트 적용 원칙

- 색상 하드코딩 금지, CSS 변수만 사용
- 상태 컴포넌트(로딩/오류/빈값)도 동일 토큰 사용
- 지도/외부 위젯 영역은 테마 변경 시 주변 컨테이너 스타일 동기화

## 7) 저장/복원 실패 대응

- LocalStorage 접근 실패(사파리 private 등) 시 메모리 상태만 사용
- 오류는 콘솔 debug 수준으로 처리하고 사용자 경험 저해 금지

## 8) QA 체크

- 최초 로딩 깜빡임(FOUC) 최소화
- 모바일/데스크톱 토글 동작 일관성
- 각 탭(학교정보/급식/시간표)에서 테마 전환 시 레이아웃 안정성 확인
