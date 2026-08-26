import { createHash, randomInt, timingSafeEqual } from "crypto";

export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

export function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function verifyOtpCode(code: string, hash: string): boolean {
  const incoming = Buffer.from(hashOtpCode(code));
  const stored = Buffer.from(hash);
  if (incoming.length !== stored.length) return false;
  return timingSafeEqual(incoming, stored);
}
