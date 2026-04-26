"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Upload, Image as ImageIcon, Folder, BarChart3, Settings, Sparkles, LogOut, Activity } from "lucide-react";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/upload", label: "Upload", icon: Upload },
  { href: "/admin/wallpapers", label: "Wallpapers", icon: ImageIcon },
  { href: "/admin/categories", label: "Categories", icon: Folder },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/setup" || pathname === "/admin/reset";
  if (isAuthPage) return <>{children}</>;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="flex bg-black text-zinc-100 min-h-screen">
      <aside className="hidden lg:flex sticky top-0 w-64 h-screen bg-zinc-950 border-r border-zinc-900 flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-zinc-900">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
          <div>
            <div className="text-sm font-semibold tracking-tight">Pixelvault</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Admin</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {items.map(it => {
            const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"}`}>
                <it.icon className="w-4 h-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-zinc-900">
          <div className="bg-zinc-900/50 rounded-lg p-3 mb-2">
            <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-zinc-400">All systems normal</span></div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="p-5 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}