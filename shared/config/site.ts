export const SITE_NAME = "MemePop";
export const SITE_DESCRIPTION =
  "유행 밈 문구를 사용자 상황에 맞게 빠르게 변형하는 밈 리믹스 서비스";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://memepop.com";

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}
