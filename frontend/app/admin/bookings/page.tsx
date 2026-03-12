"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import AdminShell from "../AdminShell";
import { adminGetBookings, adminUpdateBookingStatus, adminDeleteBooking } from "@/lib/api";
import type { BookingRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2, ExternalLink } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending:   "In attesa",
  contacted: "Contattato",
  accepted:  "Accettata",
  rejected:  "Rifiutata",
};

const STATUS_VARIANT: Record<string, "default" | "warning" | "success" | "destructive" | "outline"> = {
  pending:   "warning",
  contacted: "default",
  accepted:  "success",
  rejected:  "destructive",
};

const NEXT_STATUSES: Record<string, string[]> = {
  pending:   ["contacted", "accepted", "rejected"],
  contacted: ["accepted", "rejected"],
  accepted:  ["rejected"],
  rejected:  ["accepted"],
};

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () =>
    adminGetBookings(filter === "all" ? undefined : filter)
      .then(setBookings)
      .catch(() => {});

  useEffect(() => { load(); }, [filter]);

  const changeStatus = async (id: number, status: string) => {
    try {
      await adminUpdateBookingStatus(id, status);
      toast.success("Status aggiornato");
      load();
    } catch {
      toast.error("Errore");
    }
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Eliminare questa richiesta? L'azione è irreversibile.")) return;
    try {
      await adminDeleteBooking(id);
      toast.success("Richiesta eliminata");
      if (expanded === id) setExpanded(null);
      load();
    } catch {
      toast.error("Errore nell'eliminazione");
    }
  };

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-semibold text-gray-800">Richieste di prenotazione</h1>

          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "contacted", "accepted", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  filter === s
                    ? "bg-sea-500 text-white border-sea-500"
                    : "bg-white text-gray-500 border-gray-200 hover:border-sea-300"
                }`}
              >
                {s === "all" ? "Tutte" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Nessuna richiesta trovata.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                {/* Summary row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                  >
                    <p className="font-semibold text-gray-700">{b.name}</p>
                    <p className="text-sm text-gray-400">
                      {b.house_name ?? "Casa non specificata"} ·{" "}
                      {b.start_date ? (
                        <>
                          {new Date(b.start_date + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                          {" → "}
                          {new Date((b.end_date ?? b.start_date) + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}
                          {b.nights ? ` · ${b.nights} ${b.nights === 1 ? "notte" : "notti"}` : ""}
                          {b.total_price != null ? ` · €${b.total_price.toLocaleString("it-IT")}` : ""}
                        </>
                      ) : "Date non specificate"}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[b.status] ?? "outline"}>
                    {STATUS_LABELS[b.status] ?? b.status}
                  </Badge>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteBooking(b.id); }}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Elimina richiesta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform cursor-pointer ${expanded === b.id ? "rotate-180" : ""}`}
                    onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                  />
                </div>

                {/* Expanded details */}
                {expanded === b.id && (
                  <div className="border-t px-5 py-4 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                      {b.start_date && (
                        <div className="md:col-span-2 bg-sea-50 rounded-xl p-3 flex items-center justify-between">
                          <span className="text-sea-700 font-medium">
                            {new Date(b.start_date + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                            {" → "}
                            {new Date((b.end_date ?? b.start_date) + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                          <span className="text-sea-600 text-xs">
                            {b.nights ? `${b.nights} ${b.nights === 1 ? "notte" : "notti"}` : ""}
                          </span>
                          {b.total_price != null && (
                            <span className="font-bold text-gray-800 text-base">€{b.total_price.toLocaleString("it-IT")}</span>
                          )}
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-500">Email: </span>
                        <a href={`mailto:${b.email}`} className="text-sea-600 hover:underline">{b.email}</a>
                      </div>
                      {b.phone && (
                        <div>
                          <span className="font-medium text-gray-500">Telefono: </span>
                          <a href={`tel:${b.phone}`} className="text-sea-600 hover:underline">{b.phone}</a>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-500">Ricevuta: </span>
                        {new Date(b.created_at).toLocaleString("it-IT")}
                      </div>
                      {b.house_id && (
                        <div>
                          <Link
                            href={`/houses/${b.house_id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-sea-600 hover:text-sea-700 font-medium text-sm hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Vedi presentazione casa
                          </Link>
                        </div>
                      )}
                    </div>
                    {b.message && (
                      <div className="mb-4 p-3 bg-white rounded-lg border text-sm text-gray-600">
                        {b.message}
                      </div>
                    )}

                    {/* Status actions */}
                    <div className="flex flex-wrap gap-2">
                      {NEXT_STATUSES[b.status]?.map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={s === "rejected" ? "outline" : "default"}
                          className={s === "rejected" ? "text-red-500 border-red-200 hover:bg-red-50" : ""}
                          onClick={() => changeStatus(b.id, s)}
                        >
                          Segna: {STATUS_LABELS[s]}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-100 hover:bg-red-50 hover:text-red-600 ml-auto"
                        onClick={() => deleteBooking(b.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Elimina
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
