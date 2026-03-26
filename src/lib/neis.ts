import { Agent } from "undici";
import { NeisError } from "./neis-errors";

type QueryValue = string | number | undefined | null;

type NeisResult = {
  CODE?: string;
  MESSAGE?: string;
};

type NeisHead = {
  RESULT?: NeisResult;
  list_total_count?: number;
};

type NeisEnvelope<T> = Array<{ head?: NeisHead[]; row?: T[] }>;

function getBaseUrl() {
  return process.env.NEIS_API_BASE_URL || "https://open.neis.go.kr/hub";
}

function allowInsecureTls() {
  return process.env.NEIS_API_ALLOW_INSECURE_TLS === "true" && process.env.NODE_ENV !== "production";
}

export function requireNeisApiKey() {
  const apiKey = process.env.NEIS_API_KEY;
  if (!apiKey) {
    throw new Error("NEIS_API_KEY is not configured");
  }
  return apiKey;
}

export function buildQuery(params: Record<string, QueryValue>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    query.set(key, String(value));
  });
  return query.toString();
}

export async function fetchNeis<T extends Record<string, unknown>>(
  resource: string,
  params: Record<string, QueryValue>,
) {
  const key = requireNeisApiKey();
  const baseUrl = getBaseUrl();
  const query = buildQuery({ KEY: key, Type: "json", pIndex: 1, pSize: 1000, ...params });

  const requestInit: RequestInit & { dispatcher?: Agent } = {
    cache: "no-store",
  };

  if (allowInsecureTls()) {
    requestInit.dispatcher = new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    });
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/${resource}?${query}`, requestInit);
  } catch {
    throw new Error("NEIS 서버에 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.");
  }

  if (!response.ok) {
    throw new Error(`NEIS request failed: ${response.status}`);
  }

  let json: Record<string, NeisEnvelope<T>>;
  try {
    json = (await response.json()) as Record<string, NeisEnvelope<T>>;
  } catch {
    throw new Error("NEIS 응답 파싱에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }

  const envelope = json[resource];

  if (!Array.isArray(envelope)) {
    throw new NeisError("INFO-200", "요청한 데이터가 없습니다.");
  }

  const headBlock = envelope.find((item) => Array.isArray(item.head))?.head?.[1] || envelope[0]?.head?.[1];
  const result = headBlock?.RESULT;

  if (result?.CODE && result.CODE !== "INFO-000") {
    throw new NeisError(result.CODE, result.MESSAGE || "NEIS upstream error");
  }

  const row = envelope.find((item) => Array.isArray(item.row))?.row || [];
  return row;
}
