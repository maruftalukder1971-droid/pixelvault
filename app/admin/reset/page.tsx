"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Loader2, AlertCircle, Eye, EyeOff, Check, X, Smartphone, Key, ArrowRight } from "lucide-react";

const checkPw = (pw: string) => ({
  length: pw.length >= 12, upper: /[A-Z]/.test(pw), lower: /[a-z]/.test(pw),
  number: /\d/.test(pw), symbol: /[^A-Za-z0-9]/.test(pw), long: pw.length >= 16
});

export default function AdminReset() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const c = checkPw(pw);
  const score = [c.length, c.upper && c.lower, c.number, c.symbol, c.long].filter(Boolean).length;
  const colors = ["#ef4444","#f97316","#f59e0b","#84cc16","#22c55e","#10b981"];

  const submit = async () => {
    setErr("");
    if (score < 4) { setErr("New password must satisfy at least 4 of 5 requirements"); return; }
    if (pw !== confirm) { setErr("Passwords do not match"); return; }
    setLoading(true);
    const body: any = { username, newPassword: pw };
    if (useRecovery) body.recoveryCode = recoveryCode.trim();
    else body.totpToken = totpToken;
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Reset failed"); setLoading(false); return; }
    setDone(true); setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-black to-black" />
      <div className="relative w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
          <span className="text-xl font-semibold tracking-tight">Pixelvault</span>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          {done ? (
            <div className="text-center py-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3"><Check className="w-6 h-6 text-emerald-300" /></div>
              <h1 className="text-lg font-semibold tracking-tight mb-1">Password reset</h1>
              <p className="text-xs text-zinc-500 mb-5">You can now sign in with your new password and 2FA code.</p>
              <button onClick={() => router.push("/admin/login")} className="w-full bg-white text-black font-medium rounded-lg py-2.5 text-sm">Go to login</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center"><Shield className="w-5 h-5 text-amber-300" /></div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Reset password</h1>
                  <div className="text-xs text-zinc-500">Verify with 2FA or recovery code</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" />
                </div>

                {!useRecovery ? (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5"><Smartphone className="w-3 h-3" /> 6-digit authenticator code</label>
                    <input value={totpToken} onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, "").slice(0,6))}
                      inputMode="numeric" placeholder="123456"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-lg font-mono tracking-[0.3em] text-center focus:outline-none focus:border-violet-500" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5"><Key className="w-3 h-3" /> Recovery code</label>
                    <input value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)}
                      placeholder="xxxxxxxx-xxxxxxxx"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-zinc-600" />
                    <div className="text-[10px] text-amber-400/80 mt-1">âš ï¸ This code will be consumed on use</div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">New password</label>
                  <div className="relative">
                    <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-10 py-2.5 text-sm font-mono focus:outline-none focus:border-zinc-600" />
                    <button onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full transition-all" style={{ width: i < score ? "100%" : "0%", background: colors[Math.max(1, score)] }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm password</label>
                  <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-zinc-600" />
                </div>

                {err && <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-2.5"><AlertCircle className="w-3.5 h-3.5 mt-0.5" /><span>{err}</span></div>}

                <button onClick={submit} disabled={loading || !username || !pw || (!totpToken && !recoveryCode)}
                  className="w-full bg-white text-black font-medium rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {loading ? "Resettingâ€¦" : "Reset password"}
                </button>

                <div className="flex items-center justify-between pt-2 text-[11px]">
                  <button onClick={() => { setUseRecovery(u => !u); setTotpToken(""); setRecoveryCode(""); setErr(""); }}
                    className="text-zinc-500 hover:text-zinc-300">
                    {useRecovery ? "â† Use authenticator" : "Use recovery code â†’"}
                  </button>
                  <Link href="/admin/login" className="text-zinc-500 hover:text-zinc-300">Back to login</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}