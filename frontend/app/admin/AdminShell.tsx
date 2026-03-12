"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  Image as ImageIcon,
  MessageSquare,
  LogOut,
  Waves,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/houses",       icon: Home,            label: "Case" },
  { href: "/admin/availability", icon: CalendarDays,    label: "Disponibilità" },
  { href: "/admin/bookings",     icon: MessageSquare,   label: "Richieste" },
  { href: "/admin/media",        icon: ImageIcon,       label: "Media" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [sideOpen, setSideOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("vs_token");
    if (!token) { router.replace("/admin/login"); return; }
    setUsername(localStorage.getItem("vs_username") ?? "Admin");
  }, [router]);

  const logout = () => {
    localStorage.removeItem("vs_token");
    localStorage.removeItem("vs_username");
    router.replace("/admin/login");
  };

  const initials = username.slice(0, 2).toUpperCase() || "AD";

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          sideOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="h-8 w-8 rounded-lg bg-sea-500 flex items-center justify-center flex-shrink-0">
            <Waves className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Villa Silvia</p>
            <p className="text-[11px] text-slate-400 leading-tight">Pannello Admin</p>
          </div>
          {/* Close on mobile */}
          <button className="ml-auto md:hidden text-slate-400 hover:text-white" onClick={() => setSideOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSideOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-sea-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sea-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{username}</p>
              <p className="text-[11px] text-slate-400">Amministratore</p>
            </div>
            <button
              onClick={logout}
              title="Esci"
              className="text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSideOpen(false)}
        />
      )}

      {/* ── Main ──────────────────────────────────────────── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-5 py-3 flex items-center gap-3">
          <button
            className="md:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100"
            onClick={() => setSideOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          {/* Breadcrumb */}
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            {NAV_ITEMS.find(n => pathname.startsWith(n.href))?.label ?? "Admin"}
          </span>
        </header>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
