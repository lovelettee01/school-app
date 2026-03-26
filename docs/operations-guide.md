# Operations Guide

## Health Check
- Endpoint: `/api/health`
- Expected: `{"ok":true,"timestamp":"..."}`

## Common Incidents
- NEIS 인증 오류: API 키 확인
- 지도 미노출: Kakao JS 키/도메인 등록 확인
- 거리 계산 실패: 브라우저 위치 권한 확인

## Logs to Watch
- 5xx from `/api/neis/*`
- frequent empty responses with valid params
- map load failures (client console)

## Recovery
1. 환경변수 재확인
2. API 라우트 개별 호출 점검
3. 프론트 탭별 재시도 경로 확인
