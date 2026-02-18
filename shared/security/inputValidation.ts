import { MAX_INPUT_LENGTH } from "@/shared/config/constants";

const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;
const ZERO_WIDTH_REGEX = /[\u200B-\u200D\uFEFF]/g;
const URL_REGEX = /(https?:\/\/|www\.)/i;

const BLOCKED_PATTERNS: RegExp[] = [
  /system\s*:/i,
  /developer\s*:/i,
  /ignore\s+previous/i,
  /reveal/i,
  /jailbreak/i,
  /prompt\s*injection/i,
  /print\s+hidden/i,
  /hidden\s+prompt/i,
  /```/,
  /<script/i
];

export interface ValidationSuccess {
  ok: true;
  sanitized: string;
  riskScore: number;
}

export interface ValidationFailure {
  ok: false;
  code: "EMPTY_INPUT" | "INPUT_TOO_LONG" | "URL_NOT_ALLOWED" | "BLOCKED_PATTERN";
  message: string;
  riskScore: number;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export function sanitizeInput(rawInput: string): string {
  return rawInput
    .replace(CONTROL_CHARS_REGEX, " ")
    .replace(ZERO_WIDTH_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function validateUserInput(rawInput: string): ValidationResult {
  const sanitized = sanitizeInput(rawInput);

  if (!sanitized) {
    return {
      ok: false,
      code: "EMPTY_INPUT",
      message: "입력값이 비어 있습니다.",
      riskScore: 0
    };
  }

  if (sanitized.length > MAX_INPUT_LENGTH) {
    return {
      ok: false,
      code: "INPUT_TOO_LONG",
      message: `입력은 최대 ${MAX_INPUT_LENGTH}자까지 허용됩니다.`,
      riskScore: 0.4
    };
  }

  if (URL_REGEX.test(sanitized)) {
    return {
      ok: false,
      code: "URL_NOT_ALLOWED",
      message: "URL 입력은 허용되지 않습니다.",
      riskScore: 0.5
    };
  }

  const lowered = sanitized.toLowerCase();
  const detected = BLOCKED_PATTERNS.find((pattern) => pattern.test(lowered));
  if (detected) {
    return {
      ok: false,
      code: "BLOCKED_PATTERN",
      message: "입력에 허용되지 않는 패턴이 포함되어 있습니다.",
      riskScore: 0.9
    };
  }

  return {
    ok: true,
    sanitized,
    riskScore: 0.05
  };
}
