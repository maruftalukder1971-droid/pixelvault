import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { resetSchema, checkPasswordStrength } from "@/lib/validate";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { verifyTotp, consumeRecoveryCode } from "@/lib/totp";
import { decrypt } from "@/lib/crypto";

const GENERIC = "Reset failed â€” check your code and try again";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`reset:${ip}`, 5, 60 * 60_000).ok) return NextResponse.json({ error: "Too many reset attempts" }, { status: 429 });

  await connectDB();
  const parsed = resetSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { username, totpToken, recoveryCode, newPassword } = parsed.data;

  if (!totpToken && !recoveryCode) {
    return NextResponse.json({ error: "Provide your 2FA code or a recovery code" }, { status: 400 });
  }

  const strength = checkPasswordStrength(newPassword);
  if (!strength.valid) return NextResponse.json({ error: "New password does not meet strength requirements" }, { status: 400 });

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) return NextResponse.json({ error: GENERIC }, { status: 401 });

  let ok = false;
  if (totpToken) {
    ok = verifyTotp(totpToken, decrypt(user.totpSecretEnc));
  } else if (recoveryCode) {
    const result = await consumeRecoveryCode(recoveryCode, user.recoveryCodeHashes);
    if (result.matched) {
      user.recoveryCodeHashes = result.remaining;
      ok = true;
    }
  }
  if (!ok) return NextResponse.json({ error: GENERIC }, { status: 401 });

  user.passwordHash = await hashPassword(newPassword);
  user.failedAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  return NextResponse.json({ ok: true, recoveryCodesRemaining: user.recoveryCodeHashes.length });
}