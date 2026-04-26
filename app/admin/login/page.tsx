"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Sparkles, Loader2, AlertCircle, Eye, EyeOff, Shield, Smartphone, Key } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/setup").then(r => r.json()).then(d => {
      if (d.needsSetup) router.replace("/admin/setup");
      else setChecking(false);
    });
  }, [router]);

  const submit = async () => {
    setErr(""); setLoading(true);
    const body: any = { username, password };
    if (useRecovery) body.recoveryCode = recoveryCode.trim();
    else body.totpToken = totpToken;
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Login failed"); setLoading(false); return; }
    router.push(next);
  };

  if (checking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-black to-black" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
      <div className="relative w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
          <span className="text-xl font-semibold tracking-tight">Pixelvault</span>
        </div>
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-lg font-semibold tracking-tight">Admin sign in</h1>
          <p className="text-xs text-zinc-500 mb-5 mt-1">2FA required Â· authorized personnel only</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-10 py-2.5 text-sm font-mono focus:outline-none focus:border-zinc-600" />
                <button onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!useRecovery ? (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5"><Smartphone className="w-3 h-3" /> 6-digit code</label>
                <input value={totpToken} onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, "").slice(0,6))} onKeyDown={(e) => e.key === "Enter" && submit()}
                  inputMode="numeric" placeholder="123456"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-lg font-mono tracking-[0.3em] text-center focus:outline-none focus:border-violet-500" />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5"><Key className="w-3 h-3" /> Recovery code</label>
                <input value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="xxxxxxxx-xxxxxxxx"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-zinc-600" />
              </div>
            )}

            {err && <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-2.5"><AlertCircle className="w-3.5 h-3.5 mt-0.5" /><span>{err}</span></div>}

            <button onClick={submit} disabled={loading || !username || !password || (!totpToken && !recoveryCode)}
              className="w-full bg-white text-black font-medium rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-200 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? "Verifyingâ€¦" : "Sign in"}
            </button>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-[11px]">
              <button onClick={() => { setUseRecovery(u => !u); setErr(""); setTotpToken(""); setRecoveryCode(""); }}
                className="text-zinc-500 hover:text-zinc-300 transition">
                {useRecovery ? "â† Use authenticator code" : "Use recovery code â†’"}
              </button>
              <Link href="/admin/reset" className="text-zinc-500 hover:text-zinc-300 transition">Forgot password?</Link>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2 text-[10px] text-zinc-600 px-2">
          <Shield className="w-3 h-3 mt-0.5 text-emerald-500/70" />
          <span>bcrypt cost 12 Â· TOTP 2FA required Â· JWT in httpOnly cookie Â· 5-attempt lockout Â· IP rate-limited.</span>
        </div>
      </div>
    </div>
  );
}