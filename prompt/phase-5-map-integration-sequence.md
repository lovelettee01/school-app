# Phase 5 - 지도 연동 시퀀스 문서

작성일: 2026-03-26
목표: 탭 1(학교정보/위치)에서 카카오 지도, 길찾기, 거리 계산의 호출 순서를 확정한다.

## 1) 전제 조건

- 상세 공통 데이터에 `schoolName`, `addressRoad`는 존재한다.
- 좌표(`lat`, `lng`)는 있을 수도, 없을 수도 있다.
- 카카오 지도 JS 키가 환경변수에 설정되어 있다.

## 2) 기본 렌더 시퀀스

1. 사용자가 상세 페이지의 `info` 탭 진입
2. 학교 기본정보 영역 즉시 렌더
3. 지도 컨테이너 placeholder 렌더
4. Kakao SDK 로더 실행
5. SDK 로드 성공 시 지도 인스턴스 생성
6. 좌표 보유 여부 판단
7. 좌표 있음 -> 마커 표시 + 중심 이동
8. 좌표 없음 -> 주소 키워드/지오코딩 시도
9. 지오코딩 성공 -> 좌표 확보 후 마커 표시
10. 지오코딩 실패 -> 지도 오류/대체 UI 표시

## 3) 길찾기 시퀀스

1. 사용자가 `길찾기` 버튼 클릭
2. 학교 좌표 우선 사용, 없으면 주소 문자열 사용
3. 카카오맵 길찾기 URL 생성
4. 새 탭에서 카카오맵 열기

규칙:
- 좌표가 있으면 좌표 기반 링크 우선
- 좌표가 없으면 주소 기반 링크 fallback

## 4) 거리 계산 시퀀스

1. 사용자가 `거리 계산` 또는 `현재 위치 사용` 액션 실행
2. 브라우저 위치 권한 요청
3. 권한 허용 시 현재 위치 획득
4. 학교 좌표 확보 여부 판단
5. 좌표 확보 시 Haversine 계산
6. 거리 텍스트(예: 1.2km) 표시

fallback:
- 학교 좌표가 없으면 거리 계산 비활성 + 안내 문구 표시
- 권한 거부/실패 시 거리 계산 불가 안내

## 5) 성능 최적화 규칙

- SDK는 페이지 단위 1회 로드 후 재사용
- 탭 재진입 시 지도 인스턴스 재생성 최소화
- 주소->좌표 변환 결과는 `schoolKey` 기준 캐시

## 6) 보안/안정성 규칙

- 외부 링크 파라미터 URL 인코딩 필수
- 지도 로더 실패 시 재시도 버튼 제공
- 위치 권한은 사용자 명시 액션 시에만 요청(자동 요청 금지)

## 7) 시퀀스 다이어그램(텍스트)

```text
User -> DetailPage(info): 탭 진입
DetailPage -> KakaoLoader: SDK load()
KakaoLoader --> DetailPage: success/fail
DetailPage -> Geocoder: (if no coord) address->coord
Geocoder --> DetailPage: coord/fail
DetailPage -> Map: render marker
User -> RouteButton: 길찾기 클릭
RouteButton -> ExternalMap: open route URL
User -> DistanceButton: 거리 계산 클릭
DistanceButton -> BrowserGeolocation: request permission
BrowserGeolocation --> DistanceButton: current position/fail
DistanceButton -> DistanceUtil: calculate distance
DistanceUtil --> UI: distance text
```
