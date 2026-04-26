"use client";
export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold tracking-tight mb-4">Settings</h1>
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 text-sm text-zinc-400 space-y-3">
        <p>Most settings (ad placements, watermark, AdSense ID) are controlled via <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded text-xs">.env.local</code>.</p>
        <p>To toggle features, edit env vars and redeploy.</p>
      </div>
    </div>
  );
}