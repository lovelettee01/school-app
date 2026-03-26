export class NeisError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const CODE_MESSAGES: Record<string, string> = {
  "INFO-000": "정상 처리되었습니다.",
  "INFO-100": "인증키를 확인해 주세요.",
  "INFO-200": "요청한 데이터가 없습니다.",
  "INFO-300": "필수 파라미터가 누락되었거나 잘못되었습니다.",
  "INFO-400": "일시적으로 서비스 이용이 어렵습니다. 잠시 후 다시 시도해 주세요.",
  "ERROR-300": "필수 파라미터가 누락되었거나 잘못되었습니다.",
  "ERROR-333": "요청값 검증에 실패했습니다.",
  "ERROR-500": "NEIS 서버 오류가 발생했습니다.",
  "ERROR-600": "요청 형식을 확인해 주세요.",
};

export function mapNeisCodeMessage(code?: string, fallback?: string) {
  if (!code) {
    return fallback || "요청 처리 중 오류가 발생했습니다.";
  }
  return CODE_MESSAGES[code] || fallback || `NEIS 오류(${code})가 발생했습니다.`;
}
