# Phase 1 - 폴더 구조 설계안

작성일: 2026-03-26
목표: 라우팅, 데이터 패칭, 컴포넌트 책임을 기준으로 프로젝트 구조를 확정한다.

## 1) 라우팅 전략

- `/`
- 학교 검색(시도교육청 + 학교명)
- 학교 리스트
- 최근 조회/즐겨찾기 요약 섹션

- `/school/[schoolKey]`
- 학교 대표정보 헤더
- 탭 1: 학교정보 + 지도 + 길찾기/거리 계산
- 탭 2: 급식
- 탭 3: 시간표

- 선택적 병렬/슬롯 라우트(후속)
- `?tab=info|meal|timetable`
- 공유 URL 안정성을 위해 탭 상태는 쿼리 파라미터 동기화 권장

## 2) 권장 디렉터리 구조

```text
src/
  app/
    layout.tsx
    page.tsx                            # 홈(검색/리스트)
    school/
      [schoolKey]/
        page.tsx                        # 상세(대표정보 + 탭)
  components/
    common/
      ThemeToggle.tsx
      LoadingState.tsx
      ErrorState.tsx
      EmptyState.tsx
      Tabs.tsx
    search/
      OfficeSelect.tsx
      SchoolSearchForm.tsx
      SchoolList.tsx
      SchoolCard.tsx
      RecentSchools.tsx
      FavoriteSchools.tsx
    school/
      SchoolHeader.tsx
      SchoolInfoTab.tsx
      SchoolMapPanel.tsx
      MealTab.tsx
      TimetableTab.tsx
      RouteDistancePanel.tsx
  lib/
    api/
      neis-client.ts                    # 공통 fetch wrapper
      school-api.ts                     # 학교 기본정보
      meal-api.ts                       # 급식
      timetable-api.ts                  # 시간표
    kakao/
      map-loader.ts                     # SDK 로더
      route-link.ts                     # 길찾기 링크 생성
      distance.ts                       # 거리 계산 유틸(Haversine)
    storage/
      favorites.ts                      # 즐겨찾기 저장소
      recents.ts                        # 최근조회 저장소
      theme.ts                          # 테마 저장소
    mappers/
      school-mapper.ts
      meal-mapper.ts
      timetable-mapper.ts
    validators/
      search-validator.ts
      timetable-validator.ts
  hooks/
    useTheme.ts
    useSchoolSearch.ts
    useSchoolDetail.ts
    useMeals.ts
    useTimetable.ts
    useFavorites.ts
    useRecents.ts
    useCurrentLocation.ts
  types/
    api.ts
    school.ts
    meal.ts
    timetable.ts
    ui.ts
  constants/
    offices.ts
    theme.ts
    query-keys.ts
```

## 3) 컴포넌트 책임 분리

- `app/*` : 라우트 단위 데이터 오케스트레이션
- `components/*` : 순수 UI + 이벤트 전달
- `lib/api/*` : 외부 API 통신
- `lib/mappers/*` : API 응답 -> 내부 ViewModel 정규화
- `lib/storage/*` : LocalStorage 래퍼(즐겨찾기/최근조회/테마)
- `hooks/*` : 화면별 상태/비동기 로직

## 4) 데이터 패칭 전략

- 서버 컴포넌트
- 초기 페이지 렌더와 SEO가 필요한 고정 정보 처리

- 클라이언트 컴포넌트
- 검색 트리거, 탭 전환, 테마 토글, 즐겨찾기/최근조회, 위치 권한 등 상호작용 처리

- 권장 정책
- 검색/탭 데이터는 클라이언트 패칭
- 동일 파라미터 재조회 최소화를 위한 메모/캐시 적용
- 탭별 최초 진입 시 로딩, 이후 조건 불변이면 캐시 재사용

## 5) 상태관리 범위

- 전역(클라이언트 저장)
- `themeMode`
- `favorites`
- `recentSchools`

- 페이지 로컬
- 검색 조건(`officeCode`, `schoolName`)
- 검색 결과 및 선택 학교
- 상세 탭 상태(`activeTab`, 탭별 파라미터)

## 6) 설계 결정 메모

- `schoolKey = {officeCode}-{schoolCode}` 라우팅 키로 통일
- 지도 길찾기는 카카오맵 외부 링크 방식부터 적용(빠른 안정화)
- 거리 계산은 사용자 현재 위치 동의 시에만 활성화
