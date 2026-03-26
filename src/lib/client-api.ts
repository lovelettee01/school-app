type CacheEntry = {
  timestamp: number;
  data: unknown;
};

const CACHE = new Map<string, CacheEntry>();

type FetchOptions = {
  cacheMs?: number;
  signal?: AbortSignal;
};

export async function fetchJson<T>(url: string, options: FetchOptions = {}) {
  const { cacheMs = 0, signal } = options;
  const cached = CACHE.get(url);
  const now = Date.now();

  if (cacheMs > 0 && cached && now - cached.timestamp < cacheMs) {
    return cached.data as T;
  }

  const response = await fetch(url, { signal });
  const json = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(json.message || "요청에 실패했습니다.");
  }

  if (cacheMs > 0) {
    CACHE.set(url, { timestamp: now, data: json });
  }

  return json;
}

export function clearCache(prefix?: string) {
  if (!prefix) {
    CACHE.clear();
    return;
  }
  Array.from(CACHE.keys())
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => CACHE.delete(key));
}
