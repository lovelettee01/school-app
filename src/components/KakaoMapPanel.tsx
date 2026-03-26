"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SchoolSummary } from "@/lib/types";
import { formatDistance, getKakaoRouteUrl, haversineDistanceMeters } from "@/lib/school";

type KakaoGeocoderResult = { x: string; y: string };

type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => unknown;
  Map: new (container: HTMLElement, options: { center: unknown; level: number }) => {
    setCenter: (position: unknown) => void;
    addControl: (control: unknown, position: unknown) => void;
  };
  Marker: new (options: { map: unknown; position: unknown }) => unknown;
  MapTypeControl: new () => unknown;
  ZoomControl: new () => unknown;
  ControlPosition: {
    TOPRIGHT: unknown;
    RIGHT: unknown;
  };
  services: {
    Geocoder: new () => {
      addressSearch: (
        keyword: string,
        callback: (result: KakaoGeocoderResult[], status: string) => void,
      ) => void;
    };
    Status: { OK: string };
  };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

type Props = {
  school: SchoolSummary;
};

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours <= 0) {
    return `${mins}분`;
  }
  if (mins === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${mins}분`;
}

export default function KakaoMapPanel({ school }: Props) {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
  const [error, setError] = useState(kakaoKey ? "" : "NEXT_PUBLIC_KAKAO_MAP_APP_KEY가 없어 지도를 표시할 수 없습니다.");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState("");
  const [travelTimes, setTravelTimes] = useState<{ walk: string; bike: string; car: string } | null>(null);
  const mapId = useMemo(() => `kakao-map-${school.schoolKey}`, [school.schoolKey]);

  useEffect(() => {
    if (!kakaoKey) {
      return;
    }

    let cancelled = false;

    const setup = () => {
      const maps = window.kakao?.maps;
      if (!maps) {
        return;
      }

      maps.load(() => {
        if (cancelled) {
          return;
        }

        const container = document.getElementById(mapId);
        if (!container) {
          return;
        }

        const fallbackCenter = new maps.LatLng(37.5665, 126.978);
        const map = new maps.Map(container, {
          center: fallbackCenter,
          level: 4,
        });
        const mapTypeControl = new maps.MapTypeControl();
        map.addControl(mapTypeControl, maps.ControlPosition.TOPRIGHT);
        const zoomControl = new maps.ZoomControl();
        map.addControl(zoomControl, maps.ControlPosition.RIGHT);

        const geocoder = new maps.services.Geocoder();
        geocoder.addressSearch(school.addressRoad || school.addressJibun, (result, status) => {
          if (cancelled) {
            return;
          }

          if (status !== maps.services.Status.OK || !result[0]) {
            setError("주소 기반 위치를 찾지 못했습니다.");
            return;
          }

          const lat = Number(result[0].y);
          const lng = Number(result[0].x);
          const position = new maps.LatLng(lat, lng);
          map.setCenter(position);
          new maps.Marker({ map, position });
          setCoords({ lat, lng });
          setError("");
        });
      });
    };

    if (window.kakao?.maps) {
      setup();
    } else {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&libraries=services&autoload=false`;
      script.async = true;
      script.onload = setup;
      script.onerror = () => setError("지도를 불러오지 못했습니다.");
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [kakaoKey, mapId, school.addressJibun, school.addressRoad]);

  const handleDistance = () => {
    if (!coords) {
      setError("학교 좌표를 확인할 수 없어 거리 계산이 불가합니다.");
      return;
    }
    if (!navigator.geolocation) {
      setError("현재 브라우저에서 위치 기능을 지원하지 않습니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const meters = haversineDistanceMeters(
          position.coords.latitude,
          position.coords.longitude,
          coords.lat,
          coords.lng,
        );
        setDistance(formatDistance(meters));
        const walkMin = Math.max(1, Math.round(meters / 67));
        const bikeMin = Math.max(1, Math.round(meters / 250));
        const carMin = Math.max(1, Math.round(meters / 500));
        setTravelTimes({
          walk: formatDuration(walkMin),
          bike: formatDuration(bikeMin),
          car: formatDuration(carMin),
        });
      },
      () => {
        setError("위치 권한이 필요합니다.");
        setTravelTimes(null);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={getKakaoRouteUrl(school.schoolName, school.addressRoad)}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-contrast)]"
        >
          길찾기
        </a>
        <button
          type="button"
          onClick={handleDistance}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
        >
          거리 계산
        </button>
        {distance && <span className="text-sm text-[var(--text-muted)]">현재 위치 기준 {distance}</span>}
      </div>
      {travelTimes && (
        <div className="grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <p className="mb-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--text)]">
              <Image src="/icons/transport-walk.svg" alt="도보" width={14} height={14} />
              도보
            </p>
            <p>약 {travelTimes.walk}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <p className="mb-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--text)]">
              <Image src="/icons/transport-bike.svg" alt="자전거" width={14} height={14} />
              자전거
            </p>
            <p>약 {travelTimes.bike}</p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <p className="mb-1 inline-flex items-center gap-1 text-xs font-bold text-[var(--text)]">
              <Image src="/icons/transport-car.svg" alt="차량" width={14} height={14} />
              차량
            </p>
            <p>약 {travelTimes.car}</p>
          </div>
        </div>
      )}

      <div id={mapId} className="h-72 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]" />
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </section>
  );
}
