import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validate";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { verifyTotp, consumeRecoveryCode } from "@/lib/totp";
import { decrypt } from "@/lib/crypto";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const GENERIC = "Invalid credentials";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`login:${ip}`, 10, 60_000).ok) return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });

  await connectDB();
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: GENERIC }, { status: 401 });
  const { username, password, totpToken, recoveryCode } = parsed.data;

  if (!totpToken && !recoveryCode) {
    return NextResponse.json({ error: "2FA code or recovery code required" }, { status: 400 });
  }

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    await verifyPassword(password, "$2a$12$0000000000000000000000.0000000000000000000000000000");
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
    return NextResponse.json({ error: `Account locked. Try again in ${mins} min` }, { status: 423 });
  }

  const passOk = await verifyPassword(password, user.passwordHash);
  if (!passOk) return await registerFailure(user, GENERIC);

  let secondFactorOk = false;
  if (totpToken) {
    secondFactorOk = verifyTotp(totpToken, decrypt(user.totpSecretEnc));
  } else if (recoveryCode) {
    const { matched, remaining } = await consumeRecoveryCode(recoveryCode, user.recoveryCodeHashes);
    if (matched) {
      user.recoveryCodeHashes = remaining;
      secondFactorOk = true;
    }
  }
  if (!secondFactorOk) return await registerFailure(user, "Invalid 2FA or recovery code");

  user.failedAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLogin = new Date();
  await user.save();

  const token = signToken({ sub: user.id, username: user.username, role: user.role });
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, recoveryCodesRemaining: user.recoveryCodeHashes.length });
}

async function registerFailure(user: any, message: string) {
  user.failedAttempts = (user.failedAttempts ?? 0) + 1;
  if (user.failedAttempts >= MAX_ATTEMPTS) {
    user.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
    user.failedAttempts = 0;
    await user.save();
    return NextResponse.json({ error: `Locked for ${LOCKOUT_MS / 60_000} min` }, { status: 423 });
  }
  await user.save();
  return NextResponse.json({ error: message, remaining: MAX_ATTEMPTS - user.failedAttempts }, { status: 401 });
}