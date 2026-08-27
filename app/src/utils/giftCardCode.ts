import { createHash, randomBytes } from "crypto";

export function generateGiftCardCode(): string {
  const value = randomBytes(10).toString("hex").toUpperCase();
  return `CINE-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}`;
}

export function normalizeGiftCardCode(code: string): string { return code.trim().toUpperCase(); }
export function hashGiftCardCode(code: string): string {
  return createHash("sha256").update(normalizeGiftCardCode(code)).digest("hex");
}
