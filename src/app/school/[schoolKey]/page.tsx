"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import KakaoMapPanel from "@/components/KakaoMapPanel";
import LoadingState from "@/components/LoadingState";
import { fetchJson } from "@/lib/client-api";
import { detectSchoolLevel, endOfWeek, parseSchoolKey, startOfWeek, toYmd } from "@/lib/school";
import { MealItem, SchoolSummary, TimetableItem } from "@/lib/types";
import { useDetailStore } from "@/store/detail-store";
import { useUserStore } from "@/store/user-store";

type TabKey = "info" | "meal" | "timetable";

type SchoolResponse = { schools: SchoolSummary[]; message?: string };
type MealResponse = { meals: MealItem[]; message?: string };
type TimetableResponse = { timetable: TimetableItem[]; message?: string };

const ALLERGY_CODES = [
  "1 난류",
  "2 우유",
  "3 메밀",
  "4 땅콩",
  "5 대두",
  "6 밀",
  "7 고등어",
  "8 게",
  "9 새우",
  "10 돼지고기",
  "11 복숭아",
  "12 토마토",
  "13 아황산류",
  "14 호두",
  "15 닭고기",
  "16 쇠고기",
  "17 오징어",
  "18 조개류(굴, 전복, 홍합 포함)",
  "19 잣",
] as const;

function renderInfo(label: string, value?: string) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

function renderBreakLines(text?: string) {
  if (!text) {
    return "-";
  }
  const lines = text
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "-";
  }

  return lines.map((line, idx) => (
    <span key={`${line}-${idx}`}>
      {line}
      {idx < lines.length - 1 && <br />}
    </span>
  ));
}

export default function SchoolDetailPage() {
  const params = useParams<{ schoolKey: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const schoolKey = params.schoolKey;
  const parsed = useMemo(() => parseSchoolKey(schoolKey), [schoolKey]);

  const [school, setSchool] = useState<SchoolSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tabParam = searchParams.get("tab") as TabKey | null;
  const activeTab: TabKey = tabParam && ["info", "meal", "timetable"].includes(tabParam) ? tabParam : "info";

  const mealFrom = useDetailStore((s) => s.mealFrom);
  const mealTo = useDetailStore((s) => s.mealTo);
  const grade = useDetailStore((s) => s.grade);
  const classNo = useDetailStore((s) => s.classNo);
  const mode = useDetailStore((s) => s.mode);
  const baseDate = useDetailStore((s) => s.baseDate);
  const setMealFrom = useDetailStore((s) => s.setMealFrom);
  const setMealTo = useDetailStore((s) => s.setMealTo);
  const setGrade = useDetailStore((s) => s.setGrade);
  const setClassNo = useDetailStore((s) => s.setClassNo);
  const setMode = useDetailStore((s) => s.setMode);
  const setBaseDate = useDetailStore((s) => s.setBaseDate);
  const resetForSchool = useDetailStore((s) => s.resetForSchool);

  const [mealLoading, setMealLoading] = useState(false);
  const [mealError, setMealError] = useState("");
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [openMealKey, setOpenMealKey] = useState<string | null>(null);
  const [allergyLayerOpen, setAllergyLayerOpen] = useState(false);

  const [timeLoading, setTimeLoading] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);

  const hydrateUser = useUserStore((s) => s.hydrate);
  const isFavorite = useUserStore((s) => s.isFavorite);
  const toggleFavoriteSchool = useUserStore((s) => s.toggleFavoriteSchool);
  const pushRecentSchool = useUserStore((s) => s.pushRecentSchool);

  useEffect(() => {
    hydrateUser();
    resetForSchool(schoolKey);
  }, [hydrateUser, resetForSchool, schoolKey]);

  const fetchMeals = useCallback(async () => {
    if (!school) return;
    setMealLoading(true);
    setMealError("");
    try {
      const fromYmd = mealFrom.replaceAll("-", "");
      const toYmd = mealTo.replaceAll("-", "");
      const query = new URLSearchParams({
        officeCode: school.officeCode,
        schoolCode: school.schoolCode,
        fromYmd,
        toYmd,
      });
      const json = await fetchJson<MealResponse>(`/api/neis/meals?${query.toString()}`, { cacheMs: 5 * 60 * 1000 });
      setMeals(json.meals || []);
    } catch (e) {
      setMealError(e instanceof Error ? e.message : "급식 정보를 조회할 수 없습니다.");
      setMeals([]);
    } finally {
      setMealLoading(false);
    }
  }, [mealFrom, mealTo, school]);

  useEffect(() => {
    if (!parsed) {
      setError("잘못된 학교 식별자입니다.");
      setLoading(false);
      return;
    }

    const fetchSchool = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ officeCode: parsed.officeCode, schoolCode: parsed.schoolCode });
        const json = await fetchJson<SchoolResponse>(`/api/neis/schools?${query.toString()}`, { cacheMs: 10 * 60 * 1000 });

        const target = (json.schools || [])[0];
        if (!target) {
          throw new Error("학교 정보를 찾지 못했습니다.");
        }

        setSchool(target);
        pushRecentSchool(target);
      } catch (e) {
        setError(e instanceof Error ? e.message : "학교 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    void fetchSchool();
  }, [parsed, pushRecentSchool]);

  useEffect(() => {
    if (activeTab === "meal") {
      void fetchMeals();
    }
  }, [activeTab, fetchMeals]);

  useEffect(() => {
    if (meals.length === 0) {
      setOpenMealKey(null);
      return;
    }
    const firstKey = `${meals[0].mealDate}-0`;
    setOpenMealKey((prev) => prev ?? firstKey);
  }, [meals]);

  const fetchTimetable = async () => {
    if (!school) return;
    setTimeLoading(true);
    setTimeError("");
    try {
      const level = detectSchoolLevel(school.schoolType);
      const date = new Date(baseDate);
      const from = mode === "week" ? startOfWeek(date) : date;
      const to = mode === "week" ? endOfWeek(date) : date;

      const query = new URLSearchParams({
        officeCode: school.officeCode,
        schoolCode: school.schoolCode,
        schoolLevel: level,
        grade,
        classNo,
        fromYmd: toYmd(from),
        toYmd: toYmd(to),
      });

      const json = await fetchJson<TimetableResponse>(`/api/neis/timetable?${query.toString()}`, {
        cacheMs: 5 * 60 * 1000,
      });
      setTimetable(json.timetable || []);
    } catch (e) {
      setTimeError(e instanceof Error ? e.message : "시간표를 조회할 수 없습니다.");
      setTimetable([]);
    } finally {
      setTimeLoading(false);
    }
  };

  const groupedByDate = useMemo(() => {
    const map = new Map<string, TimetableItem[]>();
    timetable.forEach((item) => {
      const key = item.date;
      const bucket = map.get(key) || [];
      bucket.push(item);
      map.set(key, bucket);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [timetable]);

  const changeTab = (tab: TabKey) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("tab", tab);
    router.replace(`/school/${schoolKey}?${query.toString()}`);
  };

  const favorite = school ? isFavorite(school.schoolKey) : false;

  if (!parsed) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <ErrorState message="잘못된 학교 주소입니다." />
          <Link href="/" className="mt-4 inline-block underline">
            홈으로 이동
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6" aria-live="polite">
        {loading && <LoadingState message="학교 정보를 불러오는 중입니다..." />}
        {error && <ErrorState message={error} />}

        {school && (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black">{school.schoolName}</h1>
                  <p className="text-sm text-[var(--text-muted)]">
                    {school.schoolType} · {school.orgType} · {school.officeName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavoriteSchool(school)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm font-semibold"
                >
                  <Image
                    src={favorite ? "/icons/favorite-on.svg" : "/icons/favorite-off.svg"}
                    alt="즐겨찾기 상태"
                    width={16}
                    height={16}
                  />
                  {favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {renderInfo("주소", school.addressRoad || school.addressJibun)}
                {renderInfo("전화", school.tel)}
                {renderInfo("홈페이지", school.homepage)}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6">
              <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="학교 상세 탭">
                {(["info", "meal", "timetable"] as TabKey[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => changeTab(tab)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      activeTab === tab
                        ? "bg-[var(--primary)] text-[var(--primary-contrast)]"
                        : "border border-[var(--border)] bg-[var(--bg)]"
                    }`}
                  >
                    {tab === "info" ? "학교정보/위치" : tab === "meal" ? "급식" : "시간표"}
                  </button>
                ))}
              </div>

              {activeTab === "info" && (
                <div className="space-y-5" role="tabpanel">
                  <div className="grid gap-3 md:grid-cols-2">
                    {renderInfo("교육청", school.officeName)}
                    {renderInfo("지역", school.regionName)}
                    {renderInfo("설립구분", school.orgType)}
                    {renderInfo("남녀공학", school.coeduType)}
                    {renderInfo("지번주소", school.addressJibun)}
                    {renderInfo("도로명주소", school.addressRoad)}
                  </div>
                  <KakaoMapPanel school={school} />
                </div>
              )}

              {activeTab === "meal" && (
                <div className="space-y-4" role="tabpanel">
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="text-sm">
                      시작일
                      <input
                        type="date"
                        value={mealFrom}
                        onChange={(e) => setMealFrom(e.target.value)}
                        className="mt-1 block h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3"
                      />
                    </label>
                    <label className="text-sm">
                      종료일
                      <input
                        type="date"
                        value={mealTo}
                        onChange={(e) => setMealTo(e.target.value)}
                        className="mt-1 block h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void fetchMeals()}
                      className="h-10 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-contrast)]"
                    >
                      조회
                    </button>
                  </div>

                  {mealLoading && <LoadingState message="급식 정보를 조회하는 중입니다..." />}
                  {mealError && <ErrorState message={mealError} onRetry={() => void fetchMeals()} />}
                  {!mealLoading && !mealError && meals.length === 0 && (
                    <EmptyState message="해당 기간 급식 정보가 없습니다." />
                  )}

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]">
                    <button
                      type="button"
                      onClick={() => setAllergyLayerOpen((prev) => !prev)}
                      className="font-bold text-[var(--text)] "
                    >
                      <span className="font-semibold">❗ 알러지정보</span> {allergyLayerOpen ? "▲" : "▼"}
                    </button>
                    {allergyLayerOpen && (
                      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                        {ALLERGY_CODES.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {meals.map((meal, index) => (
                      <article key={`${meal.mealDate}-${index}`} className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
                        <button
                          type="button"
                          onClick={() => {
                            const key = `${meal.mealDate}-${index}`;
                            setOpenMealKey((prev) => (prev === key ? null : key));
                          }}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                          aria-expanded={openMealKey === `${meal.mealDate}-${index}`}
                        >
                          <span className="text-sm font-semibold">
                            {meal.mealDate} · {meal.mealType}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {openMealKey === `${meal.mealDate}-${index}` ? "닫기" : "보기"}
                          </span>
                        </button>

                        {openMealKey === `${meal.mealDate}-${index}` && (
                          <div className="border-t border-[var(--border)] px-4 py-3">
                            <ul className="list-disc space-y-1 pl-5 text-sm">
                              {meal.menuLines.map((line, lineIdx) => (
                                <li key={`${meal.mealDate}-${lineIdx}`}>{line}</li>
                              ))}
                            </ul>
                            <div className="mt-3 space-y-3 text-xs text-[var(--text-muted)]">
                              <p>열량: {meal.calorie || "-"}</p>
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
                                  <p className="mb-1 text-xs font-bold text-[var(--text)]">원산지 정보</p>
                                  <p>{renderBreakLines(meal.origin)}</p>
                                </div>
                                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2">
                                  <p className="mb-1 text-xs font-bold text-[var(--text)]">영양정보</p>
                                  <p>{renderBreakLines(meal.nutrition)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "timetable" && (
                <div className="space-y-4" role="tabpanel">
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="text-sm">
                      기준일
                      <input
                          type="date"
                          value={baseDate}
                          onChange={(e) => setBaseDate(e.target.value)}
                          className="mt-1 block h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3"
                      />
                    </label>
                    <label className="text-sm">
                      조회기준
                      <select
                          value={mode}
                          onChange={(e) => setMode(e.target.value as "day" | "week")}
                          className="mt-1 block h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3"
                      >
                        <option value="day">일자</option>
                        <option value="week">주간</option>
                      </select>
                    </label>
                    <label className="text-sm">
                      학년
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="mt-1 block h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3"
                      >
                        {Array.from({ length: 6 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      학급
                      <select
                        value={classNo}
                        onChange={(e) => setClassNo(e.target.value)}
                        className="mt-1 block h-10 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3"
                      >
                        {Array.from({ length: 20 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      onClick={() => void fetchTimetable()}
                      className="h-10 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-contrast)]"
                    >
                      조회
                    </button>
                  </div>

                  {timeLoading && <LoadingState message="시간표를 조회하는 중입니다..." />}
                  {timeError && <ErrorState message={timeError} onRetry={() => void fetchTimetable()} />}
                  {!timeLoading && !timeError && timetable.length === 0 && (
                    <EmptyState message="선택한 조건의 시간표가 없습니다." />
                  )}

                  <div className="space-y-3">
                    {groupedByDate.map(([date, rows]) => (
                      <article key={date} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                        <h4 className="mb-2 text-sm font-bold">{date}</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {rows.map((row, idx) => (
                            <div key={`${date}-${idx}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-sm">
                              <span className="font-semibold">{row.period}교시</span> {row.subject || "-"}
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
