# School Scope

NEIS Open API(`https://open.neis.go.kr`)를 기반으로 학교 검색, 상세 정보, 급식, 시간표를 조회하는 Next.js 웹 애플리케이션입니다.

## 주요 기능

- 시도교육청 + 학교명 기반 학교 검색
- 학교 상세 페이지(대표 정보)
- 탭 기반 상세 화면
  - 학교정보/위치: 카카오맵, 길찾기, 거리 계산
  - 급식: 기간 조회, 아코디언 상세, 원산지/영양정보 표시
  - 시간표: 학년/학급/일자·주간 기준 조회
- 즐겨찾기/최근 조회(LocalStorage)
- 라이트/다크/시스템 테마 토글(아이콘 UI)
- NEIS 응답 코드 기반 사용자 메시지 처리

## 기술 스택

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Zustand (검색/사용자/상세 상태 분리)

## 프로젝트 구조

- `src/app` 라우트 및 API 엔드포인트
- `src/components` 공통/화면 컴포넌트
- `src/lib` API/유틸/저장소
- `src/store` Zustand 스토어
- `docs` 배포 체크리스트 및 운영 가이드

## 환경 변수

`.env.local` 파일에 아래 값을 설정하세요.

```env
NEIS_API_KEY=your_neis_api_key
NEIS_API_BASE_URL=https://open.neis.go.kr/hub
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_javascript_key

# 로컬 테스트 전용(운영 비활성)
NEIS_API_ALLOW_INSECURE_TLS=false
```

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 품질 확인

```bash
npm run lint
npm run build
```

## 참고 문서

- 배포 체크리스트: `docs/deployment-checklist.md`
- 운영 가이드: `docs/operations-guide.md`
