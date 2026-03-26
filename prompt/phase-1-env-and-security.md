# Phase 1 - 환경변수 및 보안 가이드 (초안)

작성일: 2026-03-26
목표: API 키, 지도 키, 외부 호출 설정을 안전하게 관리한다.

## 1) 환경변수 목록

```env
# Server-side only
NEIS_API_KEY=ed857913a6544c60bedd3e48b751140a
NEIS_API_BASE_URL=https://open.neis.go.kr/hub

# Client-exposed (Next.js)
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=446423ff522d185e3bf4c5a6e9fbead6
NEXT_PUBLIC_APP_NAME=school-app

# Optional
NEXT_PUBLIC_DEFAULT_THEME=system
NEXT_PUBLIC_RECENT_MAX_COUNT=10
```

## 2) 변수 사용 원칙

- `NEIS_API_KEY`
- 서버에서만 사용한다.
- 브라우저 번들에 포함되면 안 된다.

- `NEXT_PUBLIC_*`
- 클라이언트 노출 가능한 값만 넣는다.
- 시크릿 값(API secret)은 절대 넣지 않는다.

## 3) 보안 설계

- API 호출 경로
- 클라이언트 -> 내부 API Route(또는 서버 액션) -> NEIS
- 직접 호출보다 내부 경유를 기본으로 하여 키 노출을 방지한다.

- 입력값 검증
- `officeCode`, `schoolName`, `grade`, `classNo`, `date`를 서버/클라이언트 모두 검증한다.
- 허용되지 않은 문자/형식은 차단한다.

- 로그 정책
- API 키, 위치정보 원문(정밀 좌표), 개인 식별 가능 데이터는 로그에 남기지 않는다.

- 위치 권한
- 거리 계산은 브라우저 위치 권한 동의 후에만 수행한다.
- 권한 거부 시 거리 영역을 비활성 + 안내 문구 표시한다.

## 4) 저장소 보안(로컬)

- 즐겨찾기/최근조회는 로컬스토리지에 저장한다.
- 저장 키 네이밍 예
- `schoolApp:favorites:v1`
- `schoolApp:recents:v1`
- `schoolApp:theme:v1`

- 민감 데이터 저장 금지
- API 키
- 인증 토큰(추후 로그인 도입 시에도 별도 보안 저장소 사용)

## 5) 배포 전 점검 항목

- `.env*` 파일이 git 추적 제외인지 확인
- 클라이언트 번들에 `NEIS_API_KEY` 문자열이 없는지 확인
- API 에러 응답에 내부 구현 정보(stack trace) 노출 여부 확인
- 지도 길찾기 링크 파라미터 인코딩 처리 확인

## 6) 권장 운영 정책

- API 호출 실패율/응답시간 모니터링
- 레이트리밋 대응(짧은 재시도 + 사용자 안내)
- 키 교체 절차 문서화(분기 1회 점검 권장)
