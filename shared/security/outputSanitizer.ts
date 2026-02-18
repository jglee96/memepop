import { MAX_OUTPUT_LENGTH } from "@/shared/config/constants";

const LINK_PATTERN = /(https?:\/\/\S+|www\.\S+)/gi;

const BLOCKED_OUTPUT_PATTERNS: RegExp[] = [
  /password/i,
  /계정\s*정보/,
  /주민등록번호/,
  /신용카드/,
  /송금/i,
  /otp/i
];

interface OutputSuccess {
  ok: true;
  output: string;
}

interface OutputFailure {
  ok: false;
  code: "BLOCKED_OUTPUT";
  message: string;
}

export type OutputSanitizeResult = OutputSuccess | OutputFailure;

export function sanitizeOutput(output: string): OutputSanitizeResult {
  const normalized = output.replace(/\s+/g, " ").trim();
  const withoutLinks = normalized.replace(LINK_PATTERN, "");
  const escaped = escapeHtml(withoutLinks).slice(0, MAX_OUTPUT_LENGTH).trim();

  const blocked = BLOCKED_OUTPUT_PATTERNS.find((pattern) => pattern.test(escaped));
  if (blocked) {
    return {
      ok: false,
      code: "BLOCKED_OUTPUT",
      message: "생성 결과가 보안 정책에 의해 차단되었습니다."
    };
  }

  return {
    ok: true,
    output: escaped
  };
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
