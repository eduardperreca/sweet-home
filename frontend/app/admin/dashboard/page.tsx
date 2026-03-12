"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "../AdminShell";
import { adminGetHouses, adminGetBookings } from "@/lib/api";
import type { House, BookingRequest } from "@/lib/api";
import {
  Home, MessageSquare, CheckCircle, Clock,
  TrendingUp, ArrowRight, Inbox,
} from "lucide-react";

export default function DashboardPage() {
  const [houses,   setHouses]   = useState<House[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      adminGetHouses().catch(() => [] as House[]),
      adminGetBookings().catch(() => [] as BookingRequest[]),
    ]).then(([h, b]) => { setHouses(h); setBookings(b); setLoading(false); });
  }, []);

  const pending  = bookings.filter(b => b.status === "pending").length;
  const accepted = bookings.filter(b => b.status === "accepted").length;
  const rejected = bookings.filter(b => b.status === "rejected").length;

  const stats = [
    {
      label: "Case",
      value: houses.length,
      icon: Home,
      color: "bg-sea-50 text-sea-600",
      border: "border-sea-100",
    },
    {
      label: "Richieste totali",
      value: bookings.length,
      icon: MessageSquare,
      color: "bg-violet-50 text-violet-600",
      border: "border-violet-100",
    },
    {
      label: "In attesa",
      value: pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
    },
    {
      label: "Accettate",
      value: accepted,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
    },
  ];

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Panoramica di Villa Silvia</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, border }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl border ${border} p-5 flex flex-col gap-3 shadow-sm`}
            >
              <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800 tabular-nums">
                  {loading ? <span className="inline-block h-8 w-8 bg-slate-100 rounded animate-pulse" /> : value}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Ultime richieste</h2>
            </div>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-1 text-xs text-sea-600 hover:text-sea-700 font-medium transition-colors"
            >
              Vedi tutte <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-50">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-32" />
                  <div className="h-4 bg-slate-100 rounded w-20" />
                  <div className="h-4 bg-slate-100 rounded w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <MessageSquare className="h-8 w-8 text-slate-200" />
              <p className="text-sm text-slate-400">Nessuna richiesta ricevuta.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Nome", "Casa", "Date", "Totale", "Stato", "Ricevuta"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.slice(0, 8).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-800">{b.name}</td>
                      <td className="px-6 py-3.5 text-slate-500 text-xs">{(b as any).house_name ?? "—"}</td>
                      <td className="px-6 py-3.5 text-slate-500 text-xs">
                        {b.start_date ? (
                          <span>
                            {new Date(b.start_date + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                            {" → "}
                            {new Date((b.end_date ?? b.start_date) + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                            {b.nights ? (
                              <span className="ml-1 text-slate-400">({b.nights} {b.nights === 1 ? "notte" : "notti"})</span>
                            ) : null}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusPill status={b.status} />
                      </td>
                      <td className="px-6 py-3.5 text-xs font-semibold text-emerald-700">
                        {b.total_price != null ? `€${b.total_price.toLocaleString("it-IT")}` : "—"}
                      </td>
                      <td className="px-6 py-3.5 text-slate-400 text-xs">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString("it-IT") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminShell>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    pending:   { label: "In attesa",  cls: "bg-amber-50 text-amber-700 ring-amber-200" },
    contacted: { label: "Contattato", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
    accepted:  { label: "Accettata",  cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    rejected:  { label: "Rifiutata",  cls: "bg-red-50 text-red-700 ring-red-200" },
  };
  const { label, cls } = cfg[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${cls}`}>
      {label}
    </span>
  );
}
