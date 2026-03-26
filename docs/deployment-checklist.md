# Deployment Checklist

## Environment
- [ ] `NEIS_API_KEY` 설정
- [ ] `NEIS_API_BASE_URL` 설정
- [ ] `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` 설정
- [ ] `.env*` 파일 git 제외 확인

## Build
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과

## Runtime
- [ ] `/api/health` 응답 확인
- [ ] 홈 검색 동작 확인
- [ ] 상세 탭(지도/급식/시간표) 확인
- [ ] 다크모드 토글/저장 확인

## Safety
- [ ] NEIS 키가 클라이언트 번들에 없는지 확인
- [ ] 에러 메시지 사용자 친화성 확인
