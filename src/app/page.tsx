"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef } from "react";
import AppHeader from "@/components/AppHeader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import Image from "next/image";
import { fetchJson } from "@/lib/client-api";
import { OFFICE_OPTIONS } from "@/lib/offices";
import { SchoolSummary } from "@/lib/types";
import { useSearchStore } from "@/store/search-store";
import { useUserStore } from "@/store/user-store";

type SchoolResponse = { schools: SchoolSummary[]; message?: string };

export default function HomePage() {
  const abortRef = useRef<AbortController | null>(null);

  const officeCode = useSearchStore((s) => s.officeCode);
  const schoolName = useSearchStore((s) => s.schoolName);
  const schools = useSearchStore((s) => s.schools);
  const loading = useSearchStore((s) => s.loading);
  const error = useSearchStore((s) => s.error);
  const setOfficeCode = useSearchStore((s) => s.setOfficeCode);
  const setSchoolName = useSearchStore((s) => s.setSchoolName);
  const setSchools = useSearchStore((s) => s.setSchools);
  const setLoading = useSearchStore((s) => s.setLoading);
  const setError = useSearchStore((s) => s.setError);
  const reset = useSearchStore((s) => s.reset);

  const favorites = useUserStore((s) => s.favorites);
  const recents = useUserStore((s) => s.recents);
  const hydrateUser = useUserStore((s) => s.hydrate);
  const isFavorite = useUserStore((s) => s.isFavorite);
  const toggleFavoriteSchool = useUserStore((s) => s.toggleFavoriteSchool);
  const pushRecentSchool = useUserStore((s) => s.pushRecentSchool);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  const runSearch = async () => {
    if (!schoolName.trim() || schoolName.trim().length < 2) {
      setError("학교명은 2글자 이상 입력해 주세요.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError("");
    setLoading(true);

    try {
      const query = new URLSearchParams({ officeCode, schoolName: schoolName.trim() });
      const json = await fetchJson<SchoolResponse>(`/api/neis/schools?${query.toString()}`, {
        cacheMs: 5 * 60 * 1000,
        signal: controller.signal,
      });
      setSchools(json.schools || []);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return;
      }
      setError(e instanceof Error ? e.message : "학교 조회에 실패했습니다.");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    await runSearch();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:p-6">
          <h1 className="text-2xl font-black tracking-tight">학교 정보 조회</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">시도교육청과 학교명을 입력해 학교를 검색해 주세요.</p>

          <form onSubmit={handleSearch} className="mt-5 grid gap-3 md:grid-cols-[1fr_2fr_auto_auto]">
            <label className="sr-only" htmlFor="office">시도교육청</label>
            <select
              id="office"
              value={officeCode}
              onChange={(e) => setOfficeCode(e.target.value)}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3"
            >
              {OFFICE_OPTIONS.map((office) => (
                <option key={office.code} value={office.code}>
                  {office.name}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="schoolName">학교명</label>
            <input
              id="schoolName"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="학교명을 입력하세요"
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3"
            />
            <button
              type="submit"
              className="h-11 rounded-xl bg-[var(--primary)] px-4 font-semibold text-[var(--primary-contrast)]"
            >
              조회
            </button>
            <button
              type="button"
              onClick={() => {
                abortRef.current?.abort();
                reset();
              }}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 font-semibold"
            >
              초기화
            </button>
          </form>

          {error && <ErrorState message={error} onRetry={() => void runSearch()} className="mt-3" />}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="text-base font-bold">최근 조회</h2>
            <div className="mt-3 flex flex-col gap-2">
              {recents.length === 0 && <EmptyState message="최근 조회 내역이 없습니다." />}
              {recents.map((item) => (
                <Link key={item.schoolKey} href={`/school/${item.schoolKey}`} className="text-sm hover:underline">
                  {item.schoolName} · {item.officeName}
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="text-base font-bold">즐겨찾기</h2>
            <div className="mt-3 flex flex-col gap-2">
              {favorites.length === 0 && <EmptyState message="즐겨찾기 내역이 없습니다." />}
              {favorites.map((item) => (
                <Link key={item.schoolKey} href={`/school/${item.schoolKey}`} className="text-sm hover:underline">
                  {item.schoolName} · {item.officeName}
                </Link>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6" aria-live="polite">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black">검색 결과</h2>
            <span className="text-sm text-[var(--text-muted)]">총 {schools.length}건</span>
          </div>

          {loading && <LoadingState message="학교 정보를 불러오는 중입니다..." />}
          {!loading && !error && schools.length === 0 && (
            <EmptyState message="검색 결과가 없습니다. 조건을 변경해 다시 조회해 주세요." />
          )}

          <div className="mt-3 grid gap-3">
            {schools.map((school) => (
              <article
                key={school.schoolKey}
                className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 md:grid-cols-[1fr_auto]"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">{school.schoolName}</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {school.schoolType} · {school.orgType} · {school.officeName}
                  </p>
                  <p className="text-sm">{school.addressRoad || school.addressJibun}</p>
                  {school.tel && <p className="text-sm text-[var(--text-muted)]">☎ {school.tel}</p>}
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => toggleFavoriteSchool(school)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    <Image
                      src={isFavorite(school.schoolKey) ? "/icons/favorite-on.svg" : "/icons/favorite-off.svg"}
                      alt="즐겨찾기 상태"
                      width={16}
                      height={16}
                    />
                    {isFavorite(school.schoolKey) ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  </button>
                  <Link
                    href={`/school/${school.schoolKey}`}
                    onClick={() => pushRecentSchool(school)}
                    className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-contrast)]"
                  >
                    상세 보기
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
