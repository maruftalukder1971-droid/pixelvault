"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ImageIcon, Download, Eye, HardDrive, Upload, Folder, BarChart3, Settings, ChevronRight, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fmt = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n ?? 0);
const fmtSize = (b: number) => b > 1e9 ? (b/1e9).toFixed(2)+" GB" : (b/1e6).toFixed(1)+" MB";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/admin/analytics").then(r => r.json()).then(setData); }, []);
  if (!data) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-600" /></div>;

  const stats = [
    { icon: ImageIcon, label: "Total wallpapers", value: fmt(data.totalWallpapers) },
    { icon: Download, label: "Downloads", value: fmt(data.downloads) },
    { icon: Eye, label: "Page views", value: fmt(data.views) },
    { icon: HardDrive, label: "Storage used", value: fmtSize(data.storageBytes) }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center mb-3"><s.icon className="w-3.5 h-3.5" /></div>
            <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Last 30 days Â· downloads</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={data.trend.map((t: any) => ({ date: t._id.slice(5), downloads: t.downloads }))}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} /><stop offset="100%" stopColor="#a78bfa" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} />
              <YAxis stroke="#52525b" fontSize={11} tickFormatter={fmt} />
              <Tooltip contentStyle={{ background:"#09090b", border:"1px solid #27272a", borderRadius:8, fontSize:12 }} />
              <Area type="monotone" dataKey="downloads" stroke="#a78bfa" fill="url(#g)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Upload, label: "Upload wallpaper", href: "/admin/upload" },
          { icon: Folder, label: "Manage categories", href: "/admin/categories" },
          { icon: BarChart3, label: "View analytics", href: "/admin/analytics" },
          { icon: Settings, label: "Settings", href: "/admin/settings" }
        ].map(a => (
          <Link key={a.href} href={a.href} className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-3 transition">
            <div className="w-8 h-8 rounded-md bg-zinc-950 flex items-center justify-center"><a.icon className="w-4 h-4" /></div>
            <span className="text-xs font-medium">{a.label}</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}