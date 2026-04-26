import { z } from "zod";

export function checkPasswordStrength(pw: string) {
  const checks = {
    length: pw.length >= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw)
  };
  let score = 0;
  if (checks.length) score++;
  if (checks.upper && checks.lower) score++;
  if (checks.number) score++;
  if (checks.symbol) score++;
  if (pw.length >= 16) score++;
  if (/^(password|admin|123|qwerty|letmein|welcome|abc)/i.test(pw)) score = Math.max(0, score - 3);
  if (pw.length > 0 && /^(.)\1+$/.test(pw)) score = 0;
  return { score: Math.min(5, score), checks, valid: score >= 4 };
}

export const setupBeginSchema = z.object({
  username: z.string().min(3).max(40).regex(/^[a-z0-9_-]+$/i)
});

export const setupCompleteSchema = z.object({
  setupId: z.string().min(20),
  password: z.string().min(12).max(200),
  totpToken: z.string().regex(/^\d{6}$/)
});

export const loginSchema = z.object({
  username: z.string().min(1).max(40),
  password: z.string().min(1).max(200),
  totpToken: z.string().regex(/^\d{6}$/).optional(),
  recoveryCode: z.string().min(8).max(40).optional()
});

export const resetSchema = z.object({
  username: z.string().min(1).max(40),
  totpToken: z.string().regex(/^\d{6}$/).optional(),
  recoveryCode: z.string().min(8).max(40).optional(),
  newPassword: z.string().min(12).max(200)
});

export const wallpaperSchema = z.object({
  title: z.string().min(2).max(120).trim(),
  categoryId: z.string().regex(/^[0-9a-f]{24}$/),
  tags: z.array(z.string().min(1).max(30).trim()).max(20).default([]),
  featured: z.boolean().optional().default(false)
});

export const categorySchema = z.object({
  name: z.string().min(2).max(40).trim(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i)
});

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");