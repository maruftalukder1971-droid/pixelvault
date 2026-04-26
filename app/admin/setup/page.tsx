"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, Loader2, AlertCircle, Eye, EyeOff, Check, X, Copy, Smartphone, Key, Download, ArrowRight } from "lucide-react";

const generateStrongPassword = (length = 20) => {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ","abcdefghijkmnopqrstuvwxyz","23456789","!@#$%^&*()_+-="];
  const all = sets.join("");
  const r = new Uint32Array(length);
  crypto.getRandomValues(r);
  const c = sets.map((s,i) => s[r[i] % s.length]);
  for (let i = sets.length; i < length; i++) c.push(all[r[i] % all.length]);
  return c.sort(() => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295 - 0.5).join("");
};

const checkPw = (pw: string) => ({
  length: pw.length >= 12, upper: /[A-Z]/.test(pw), lower: /[a-z]/.test(pw),
  number: /\d/.test(pw), symbol: /[^A-Za-z0-9]/.test(pw), long: pw.length >= 16
});

export default function AdminSetup() {
  const router = useRouter();
  const [step, setStep] = useState<"username"|"qr"|"password"|"recovery"|"done">("username");
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("admin");
  const [setupId, setSetupId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [totpToken, setTotpToken] = useState("");

  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryAck, setRecoveryAck] = useState(false);

  useEffect(() => {
    fetch("/api/auth/setup").then(r => r.json()).then(d => {
      if (!d.needsSetup) router.replace("/admin/login");
      else setChecking(false);
    });
  }, [router]);

  const c = checkPw(pw);
  const score = [c.length, c.upper && c.lower, c.number, c.symbol, c.long].filter(Boolean).length;
  const labels = ["Very weak","Weak","Okay","Good","Strong","Excellent"];
  const colors = ["#ef4444","#f97316","#f59e0b","#84cc16","#22c55e","#10b981"];

  const beginSetup = async () => {
    setErr(""); setLoading(true);
    const res = await fetch("/api/auth/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Failed"); setLoading(false); return; }
    setSetupId(data.setupId);
    setQrUrl(data.qr);
    setSecret(data.secret);
    setStep("qr");
    setLoading(false);
  };

  const completeSetup = async () => {
    setErr("");
    if (!/^\d{6}$/.test(totpToken)) { setErr("Enter the 6-digit code from your authenticator app"); return; }
    if (score < 4) { setErr("Password must satisfy at least 4 of 5 base requirements"); return; }
    if (pw !== confirm) { setErr("Passwords do not match"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/setup", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setupId, password: pw, totpToken })
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error ?? "Setup failed"); setLoading(false); return; }
    setRecoveryCodes(data.recoveryCodes);
    setStep("recovery");
    setLoading(false);
  };

  const gen = () => { const p = generateStrongPassword(20); setPw(p); setConfirm(p); setShowPw(true); setGenerated(true); };
  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(null), 2000);
  };
  const downloadCodes = () => {
    const blob = new Blob([
      `Pixelvault recovery codes for ${username}\nGenerated: ${new Date().toISOString()}\n\n` +
      `IMPORTANT: store these somewhere safe (password manager, printed copy in a safe).\n` +
      `Each code works once. If you lose your authenticator, use one of these to log in or reset your password.\n\n` +
      recoveryCodes.map((c, i) => `${(i+1).toString().padStart(2,"0")}.  ${c}`).join("\n")
    ], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pixelvault-recovery-codes-${username}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (checking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-black to-black" />
      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
          <span className="text-xl font-semibold tracking-tight">Pixelvault</span>
        </div>

        <div className="flex items-center gap-2 mb-4 justify-center text-[10px] uppercase tracking-wider">
          {["username","qr","password","recovery"].map((s, i) => {
            const order = ["username","qr","password","recovery"];
            const reached = order.indexOf(step) >= i;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${reached ? "bg-violet-500 text-white" : "bg-zinc-800 text-zinc-500"}`}>{i+1}</div>
                {i < 3 && <div className={`w-4 h-px ${reached && order.indexOf(step) > i ? "bg-violet-500" : "bg-zinc-800"}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
          {step === "username" && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"><Shield className="w-5 h-5 text-violet-300" /></div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Create admin account</h1>
                  <div className="text-xs text-zinc-500">Choose your admin username</div>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mb-5">Two-factor authentication will be required at every login.</p>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && beginSetup()}
                placeholder="admin" autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-600" />
              {err && <div className="mt-3 flex items-start gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-2.5"><AlertCircle className="w-3.5 h-3.5 mt-0.5" /><span>{err}</span></div>}
              <button onClick={beginSetup} disabled={loading || username.length < 3}
                className="mt-5 w-full bg-white text-black font-medium rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Continue
              </button>
            </>
          )}

          {step === "qr" && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"><Smartphone className="w-5 h-5 text-violet-300" /></div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Scan with authenticator</h1>
                  <div className="text-xs text-zinc-500">Google Authenticator, Authy, 1Password</div>
                </div>
              </div>
              <div className="flex justify-center my-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  {qrUrl && <img src={qrUrl} alt="TOTP QR code" className="w-48 h-48" />}
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 mb-3 text-center">
                Can't scan? Enter this secret manually:
              </div>
              <button onClick={() => copy(secret, "secret")}
                className="w-full font-mono text-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 flex items-center justify-between hover:bg-zinc-900 transition group">
                <span className="text-zinc-300 break-all text-left">{secret}</span>
                <span className="flex-shrink-0 ml-2">{copied === "secret" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />}</span>
              </button>
              <button onClick={() => setStep("password")} className="mt-5 w-full bg-white text-black font-medium rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-200 flex items-center justify-center gap-2">
                I've added it to my app <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setStep("username")} className="mt-2 w-full text-xs text-zinc-500 hover:text-zinc-300 py-2">â† Back</button>
            </>
          )}

          {step === "password" && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"><Key className="w-5 h-5 text-violet-300" /></div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Set password & verify</h1>
                  <div className="text-xs text-zinc-500">Enter the 6-digit code to confirm 2FA works</div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">6-digit code from authenticator</label>
                  <input value={totpToken} onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, "").slice(0,6))}
                    placeholder="123456" inputMode="numeric" autoFocus
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-lg font-mono tracking-[0.3em] text-center focus:outline-none focus:border-violet-500" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-zinc-400">Password</label>
                    <button onClick={gen} className="text-[11px] text-violet-300 hover:text-violet-200 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Generate strong</button>
                  </div>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); setGenerated(false); }}
                      placeholder="Min 12 chars Â· upper Â· lower Â· number Â· symbol"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-3 pr-10 py-2.5 text-sm font-mono focus:outline-none focus:border-zinc-600" />
                    <button onClick={() => setShowPw(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {generated && <button onClick={() => copy(pw, "pw")} className={`text-[11px] mt-1.5 flex items-center gap-1 ${copied === "pw" ? "text-emerald-300" : "text-emerald-400 hover:text-emerald-300"}`}><Check className="w-3 h-3" /> {copied === "pw" ? "Copied â€” save it!" : "Copy & save somewhere safe"}</button>}
                  <div className="mt-2.5">
                    <div className="flex gap-1 mb-2">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                          <div className="h-full transition-all" style={{ width: i < score ? "100%" : "0%", background: colors[Math.max(1, score)] }} />
                        </div>
                      ))}
                    </div>
                    {pw && <div className="text-[11px] mb-2 font-medium" style={{ color: colors[score] }}>{labels[score]}</div>}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      {[["12+ chars",c.length],["Uppercase",c.upper],["Lowercase",c.lower],["Number",c.number],["Symbol",c.symbol],["16+ (bonus)",c.long]].map(([l, ok]: any) => (
                        <div key={l} className={`flex items-center gap-1.5 ${ok ? "text-emerald-400" : "text-zinc-600"}`}>
                          {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}{l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm password</label>
                  <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-zinc-600" />
                  {confirm && <div className={`text-[11px] mt-1 flex items-center gap-1 ${pw === confirm ? "text-emerald-400" : "text-red-400"}`}>{pw === confirm ? <><Check className="w-3 h-3" /> Match</> : <><X className="w-3 h-3" /> No match</>}</div>}
                </div>

                {err && <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-2.5"><AlertCircle className="w-3.5 h-3.5 mt-0.5" /><span>{err}</span></div>}

                <button onClick={completeSetup} disabled={loading} className="w-full bg-white text-black font-medium rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {loading ? "Creating accountâ€¦" : "Create admin account"}
                </button>
                <button onClick={() => setStep("qr")} className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-2">â† Back to QR</button>
              </div>
            </>
          )}

          {step === "recovery" && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center"><Key className="w-5 h-5 text-amber-300" /></div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Save recovery codes</h1>
                  <div className="text-xs text-amber-300">Shown ONCE. Without these you cannot recover access.</div>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mb-3">Each code works once. Use one if you lose your phone or 2FA app.</p>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs">
                {recoveryCodes.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-zinc-600">{(i+1).toString().padStart(2,"0")}.</span>
                    <span className="text-zinc-200">{c}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={() => copy(recoveryCodes.join("\n"), "codes")} className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 rounded-lg py-2 text-xs flex items-center justify-center gap-2">
                  {copied === "codes" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copied === "codes" ? "Copied" : "Copy"}
                </button>
                <button onClick={downloadCodes} className="bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 rounded-lg py-2 text-xs flex items-center justify-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Download .txt
                </button>
              </div>
              <label className="flex items-start gap-2 mt-4 text-xs text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={recoveryAck} onChange={(e) => setRecoveryAck(e.target.checked)} className="mt-0.5 accent-violet-500" />
                <span>I've saved these codes in a safe place (password manager / printed / vault)</span>
              </label>
              <button onClick={() => router.push("/admin")} disabled={!recoveryAck}
                className="w-full mt-4 bg-white text-black font-medium rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2">
                Continue to admin <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}