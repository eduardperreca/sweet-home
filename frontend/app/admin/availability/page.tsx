"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  format,
  eachDayOfInterval,
  differenceInCalendarDays,
  parseISO,
} from "date-fns";
import { it } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import AdminShell from "../AdminShell";
import {
  adminGetHouses,
  adminGetAvailability,
  adminSetAvailability,
  adminDeleteAvailability,
} from "@/lib/api";
import type { House, AvailabilityRecord } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock, Unlock, Euro, RotateCcw, CalendarDays,
  ChevronLeft, ChevronRight, MousePointerClick,
} from "lucide-react";
import "react-day-picker/dist/style.css";
import "./adm-cal.css";

type ActionMode = "block" | "unblock" | "price" | "reset" | null;

export default function AvailabilityAdminPage() {
  const [houses,       setHouses]       = useState<House[]>([]);
  const [houseId,      setHouseId]      = useState<number | null>(null);
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [month,        setMonth]        = useState(new Date());
  const [range,        setRange]        = useState<DateRange | undefined>();
  const [actionMode,   setActionMode]   = useState<ActionMode>(null);
  const [priceInput,   setPriceInput]   = useState("");
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    adminGetHouses().then((hs) => {
      setHouses(hs);
      if (hs.length) setHouseId(hs[0].id);
    });
  }, []);

  const load = useCallback(() => {
    if (!houseId) return;
    adminGetAvailability(houseId).then(setAvailability).catch(() => {});
  }, [houseId]);

  useEffect(() => {
    load();
    setRange(undefined);
    setActionMode(null);
  }, [load]);

  const availMap = new Map<string, AvailabilityRecord>(
    availability.map((r) => [r.date, r])
  );

  const blockedDays = availability
    .filter((r) => !r.is_available)
    .map((r) => parseISO(r.date + "T12:00:00"));

  const pricedDays = availability
    .filter((r) => r.is_available && r.price != null)
    .map((r) => parseISO(r.date + "T12:00:00"));

  const nights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from) + 1
      : range?.from ? 1 : 0;

  const getDatesInRange = (): Date[] => {
    if (!range?.from) return [];
    if (!range?.to) return [range.from];
    return eachDayOfInterval({ start: range.from, end: range.to });
  };

  const handleBulkAction = async () => {
    if (!houseId || !range?.from) return;
    const dates = getDatesInRange();
    setSaving(true);
    try {
      if (actionMode === "block") {
        await adminSetAvailability(
          houseId,
          dates.map((d) => ({ date: format(d, "yyyy-MM-dd"), is_available: false }))
        );
        toast.success(`${dates.length} ${dates.length === 1 ? "giorno bloccato" : "giorni bloccati"}`);
      } else if (actionMode === "unblock") {
        for (const d of dates) {
          const rec = availMap.get(format(d, "yyyy-MM-dd"));
          if (rec) await adminDeleteAvailability(rec.id);
        }
        toast.success(`${dates.length} ${dates.length === 1 ? "giorno sbloccato" : "giorni sbloccati"}`);
      } else if (actionMode === "price") {
        const price = parseFloat(priceInput);
        if (isNaN(price) || price <= 0) { toast.error("Inserisci un prezzo valido"); setSaving(false); return; }
        await adminSetAvailability(
          houseId,
          dates.map((d) => ({ date: format(d, "yyyy-MM-dd"), price, is_available: true }))
        );
        toast.success(`Prezzo €${price} per ${dates.length} ${dates.length === 1 ? "giorno" : "giorni"}`);
      } else if (actionMode === "reset") {
        for (const d of dates) {
          const rec = availMap.get(format(d, "yyyy-MM-dd"));
          if (rec) await adminDeleteAvailability(rec.id);
        }
        toast.success(`${dates.length} ${dates.length === 1 ? "giorno" : "giorni"} ripristinati`);
      }
      setRange(undefined);
      setActionMode(null);
      setPriceInput("");
      load();
    } catch {
      toast.error("Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const house = houses.find((h) => h.id === houseId);
  const blockedList = availability
    .filter((r) => !r.is_available)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Disponibilità e prezzi</h1>
          <p className="text-sm text-slate-500 mt-1">Seleziona un range di date, poi applica un'azione</p>
        </div>

        {/* House tabs */}
        {houses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {houses.map((h) => (
              <button
                key={h.id}
                onClick={() => setHouseId(h.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  houseId === h.id
                    ? "bg-sea-500 text-white border-sea-500 shadow-sm shadow-sea-200"
                    : "bg-white text-slate-500 border-slate-200 hover:border-sea-300 hover:text-sea-600"
                }`}
              >
                {h.name}
              </button>
            ))}
          </div>
        )}

        {house && (
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

            {/* ── Calendar card ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sea-500" />
                  <span className="text-sm font-semibold text-slate-700">Calendario</span>
                </div>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-red-100 border border-red-200 inline-block" />
                    Bloccato
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-green-100 border border-green-200 inline-block" />
                    Prezzo custom
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-sky-100 border border-sky-200 inline-block" />
                    Selezionato
                  </span>
                </div>
              </div>

              {/* DayPicker */}
              <div className="adm-cal px-6 py-5">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={(r) => { setRange(r); setActionMode(null); }}
                  locale={it}
                  numberOfMonths={1}
                  month={month}
                  onMonthChange={setMonth}
                  modifiers={{ blocked: blockedDays, priced: pricedDays }}
                  modifiersClassNames={{ blocked: "blocked-day", priced: "priced-day" }}
                  components={{
                    IconLeft:  () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                    DayContent: ({ date }) => {
                      const key = format(date, "yyyy-MM-dd");
                      const rec = availMap.get(key);
                      return (
                        <div className="flex flex-col items-center justify-center w-full h-full gap-[1px]">
                          <span className="leading-none">{date.getDate()}</span>
                          {rec?.is_available && rec.price != null && (
                            <span className="text-[9px] font-bold leading-none opacity-80">
                              €{rec.price}
                            </span>
                          )}
                          {rec && !rec.is_available && (
                            <span className="text-[9px] font-bold leading-none opacity-70">✕</span>
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </div>

              {/* Base price note */}
              <div className="px-6 pb-5">
                <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                  Prezzo base: <strong className="text-slate-600">€{house.base_price}/notte</strong>
                  {" · "} I giorni senza prezzo custom usano il prezzo base.
                </p>
              </div>
            </div>

            {/* ── Right panel ── */}
            <div className="space-y-4">

              {/* Selection info */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Selezione attiva
                </p>
                {!range?.from ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-slate-300">
                    <MousePointerClick className="h-7 w-7" />
                    <p className="text-xs text-center text-slate-400">
                      Clicca sul calendario per selezionare le date
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-800">
                      {format(range.from, "d MMM", { locale: it })}
                      {range.to && range.to.getTime() !== range.from.getTime() && (
                        <> → {format(range.to, "d MMM yyyy", { locale: it })}</>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {nights} {nights === 1 ? "giorno" : "giorni"} selezionati
                    </p>
                    <button
                      onClick={() => { setRange(undefined); setActionMode(null); }}
                      className="mt-2 text-xs text-slate-400 hover:text-red-500 underline transition-colors"
                    >
                      Cancella selezione
                    </button>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Azione
                </p>

                {[
                  { mode: "block"   as ActionMode, label: "Blocca periodo",       icon: Lock,      base: "bg-red-50 border-red-100 text-red-600",     active: "bg-red-500 border-red-500 text-white" },
                  { mode: "unblock" as ActionMode, label: "Sblocca periodo",       icon: Unlock,    base: "bg-emerald-50 border-emerald-100 text-emerald-600", active: "bg-emerald-500 border-emerald-500 text-white" },
                  { mode: "price"   as ActionMode, label: "Prezzo personalizzato", icon: Euro,      base: "bg-sky-50 border-sky-100 text-sky-600",     active: "bg-sky-500 border-sky-500 text-white" },
                  { mode: "reset"   as ActionMode, label: "Ripristina default",    icon: RotateCcw, base: "bg-slate-50 border-slate-200 text-slate-600", active: "bg-slate-700 border-slate-700 text-white" },
                ].map(({ mode, label, icon: Icon, base, active }) => (
                  <button
                    key={mode}
                    disabled={!range?.from}
                    onClick={() => setActionMode(actionMode === mode ? null : mode)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed
                      ${actionMode === mode ? active : base + " hover:brightness-95"}`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </button>
                ))}

                {actionMode === "price" && (
                  <div className="pt-2 space-y-1.5">
                    <Label className="text-xs text-slate-500">Prezzo per notte (€)</Label>
                    <Input
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      placeholder={`Default: €${house.base_price}`}
                      className="h-9 text-sm"
                      autoFocus
                    />
                  </div>
                )}

                {actionMode && (
                  <Button
                    onClick={handleBulkAction}
                    disabled={saving || !range?.from}
                    className="w-full mt-1"
                    size="sm"
                  >
                    {saving ? "Salvataggio…" : "Conferma"}
                  </Button>
                )}
              </div>

              {/* Blocked list */}
              {blockedList.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Giorni bloccati ({blockedList.length})
                  </p>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {blockedList.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2"
                      >
                        <span className="text-xs font-semibold text-red-700">
                          {format(parseISO(r.date), "d MMM yyyy", { locale: it })}
                        </span>
                        <button
                          onClick={async () => {
                            await adminDeleteAvailability(r.id);
                            load();
                            toast.success("Giorno sbloccato");
                          }}
                          className="text-xs text-red-400 hover:text-red-700 font-semibold transition-colors"
                        >
                          Sblocca
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
