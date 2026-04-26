"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2 } from "lucide-react";

const fmt = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3).toFixed(1)+"K" : String(n);

export default function AnalyticsPage() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { fetch("/api/admin/analytics").then(r => r.json()).then(setD); }, []);
  if (!d) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-600" /></div>;
  const trend = d.trend.map((t: any) => ({ date: t._id.slice(5), downloads: t.downloads }));
  const byCat = d.byCategory.filter((c: any) => c.downloads > 0);
  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold tracking-tight">Analytics</h1>
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-3">30-day downloads</h2>
        <div className="h-72">
          <ResponsiveContainer><AreaChart data={trend}>
            <defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} /><stop offset="100%" stopColor="#a78bfa" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" stroke="#52525b" fontSize={11} />
            <YAxis stroke="#52525b" fontSize={11} tickFormatter={fmt} />
            <Tooltip contentStyle={{ background:"#09090b", border:"1px solid #27272a", borderRadius:8, fontSize:12 }} />
            <Area type="monotone" dataKey="downloads" stroke="#a78bfa" fill="url(#a)" strokeWidth={2} />
          </AreaChart></ResponsiveContainer>
        </div>
      </div>
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-3">By category</h2>
        <div className="h-64">
          <ResponsiveContainer><BarChart data={byCat} layout="vertical">
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="#52525b" fontSize={11} tickFormatter={fmt} />
            <YAxis dataKey="name" type="category" stroke="#52525b" fontSize={11} width={80} />
            <Tooltip contentStyle={{ background:"#09090b", border:"1px solid #27272a", borderRadius:8, fontSize:12 }} cursor={{ fill: "#18181b" }} />
            <Bar dataKey="downloads" radius={[0, 4, 4, 0]}>{byCat.map((c: any, i: number) => <Cell key={i} fill={c.color} />)}</Bar>
          </BarChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}