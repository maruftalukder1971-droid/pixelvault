import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import bcrypt from "bcryptjs";

authenticator.options = { window: 1, step: 30 };
const ISSUER = "Pixelvault";

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function buildOtpAuthUrl(username: string, secret: string): string {
  return authenticator.keyuri(username, ISSUER, secret);
}

export async function buildQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, scale: 6, color: { dark: "#f4f4f5", light: "#0a0a0a" } });
}

export function verifyTotp(token: string, secret: string): boolean {
  if (!/^\d{6}$/.test(token ?? "")) return false;
  try { return authenticator.check(token, secret); } catch { return false; }
}

export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const a = crypto.randomBytes(4).toString("hex");
    const b = crypto.randomBytes(4).toString("hex");
    return `${a}-${b}`;
  });
}

export async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => bcrypt.hash(c.toLowerCase(), 10)));
}

export async function consumeRecoveryCode(input: string, hashes: string[]): Promise<{ matched: boolean; remaining: string[] }> {
  const cleaned = input.trim().toLowerCase();
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(cleaned, hashes[i])) {
      return { matched: true, remaining: hashes.filter((_, idx) => idx !== i) };
    }
  }
  return { matched: false, remaining: hashes };
}