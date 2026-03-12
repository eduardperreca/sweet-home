"use client";

import { useState, useEffect, useCallback } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import {
  format,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { it } from "date-fns/locale";
import { getHouseAvailability } from "@/lib/api";
import type { AvailabilityRecord } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

interface Props {
  houseId: number;
  basePrice: number;
  onRangeChange?: (range: DateRange | undefined) => void;
  onError?: (msg: string | null) => void;
}

export default function AvailabilityCalendar({
  houseId,
  basePrice,
  onRangeChange,
  onError,
}: Props) {
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  const [month, setMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // Load current + next month on mount and on month change
  const fetchMonth = useCallback(
    async (m: Date) => {
      const key = format(m, "yyyy-MM");
      try {
        const data = await getHouseAvailability(houseId, key);
        setAvailability((prev) => {
          const existing = prev.filter((r) => !r.date.startsWith(key));
          return [...existing, ...data];
        });
      } catch {
        // silent
      }
    },
    [houseId]
  );

  useEffect(() => {
    fetchMonth(month);
    fetchMonth(addMonths(month, 1));
  }, [fetchMonth, month]);

  const availMap = new Map<string, AvailabilityRecord>(
    availability.map((r) => [r.date, r])
  );

  const blockedDates = availability
    .filter((r) => !r.is_available)
    .map((r) => new Date(r.date + "T12:00:00"));

  // Compute price range across all loaded records for relative colour coding
  const customPrices = availability
    .filter((r) => r.is_available && r.price != null)
    .map((r) => r.price as number);
  const allKnownPrices = customPrices.length ? customPrices : [basePrice];
  const priceMin = Math.min(...allKnownPrices, basePrice);
  const priceMax = Math.max(...allKnownPrices, basePrice);
  const priceRange = priceMax - priceMin;

  const priceColor = (price: number): string => {
    if (priceRange === 0) return "#16a34a"; // tutto uguale → verde (stabile/economico)
    const ratio = (price - priceMin) / priceRange;
    if (ratio <= 0.35) return "#16a34a"; // green
    if (ratio <= 0.65) return "#d97706"; // amber
    return "#dc2626"; // red
  };

  const fmtPrice = (p: number) =>
    p >= 1000 ? `€${(p / 1000).toFixed(1)}k` : `€${Math.round(p)}`;

  // Check if any blocked day falls inside a range
  const hasBlockedInRange = useCallback(
    (from: Date, to: Date): boolean => {
      return eachDayOfInterval({ start: from, end: to }).some((d) =>
        blockedDates.some((bd) => isSameDay(bd, d))
      );
    },
    [blockedDates]
  );

  const handleSelect = (r: DateRange | undefined) => {
    // Clear error on new selection
    if (!r) {
      setRange(undefined);
      onRangeChange?.(undefined);
      setError(null);
      onError?.(null);
      return;
    }

    if (r.from && r.to) {
      if (hasBlockedInRange(r.from, r.to)) {
        const msg = "Il periodo selezionato include date non disponibili. Scegli date diverse.";
        setError(msg);
        onError?.(msg);
        setRange({ from: r.from, to: undefined });
        onRangeChange?.({ from: r.from, to: undefined });
        return;
      }
    }

    setError(null);
    onError?.(null);
    setRange(r);
    onRangeChange?.(r);
  };

  const nights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;

  // Average price across selected range
  const totalPrice = (() => {
    if (!range?.from || !range?.to || nights <= 0) return 0;
    const days = eachDayOfInterval({ start: range.from, end: addMonths(range.to, 0) }).slice(0, nights);
    return days.reduce((sum, d) => {
      const key = format(d, "yyyy-MM-dd");
      return sum + (availMap.get(key)?.price ?? basePrice);
    }, 0);
  })();

  return (
    <div className="select-none">
      <style>{`
        /* --- Airbnb-inspired DayPicker overrides --- */
        .vs-cal .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #222222;
          --rdp-background-color: #f7f7f7;
          margin: 0;
          font-family: inherit;
        }
        .vs-cal .rdp-months { gap: 16px; flex-wrap: wrap; }
        .vs-cal .rdp-table { width: 100%; border-collapse: collapse; }
        /* Extra bottom room in each cell for the price label below the circle */
        .vs-cal .rdp-cell { padding-bottom: 14px; vertical-align: top; }
        /* Button must be a perfect circle: force width = height */
        .vs-cal .rdp-button {
          height: var(--rdp-cell-size) !important;
          width: var(--rdp-cell-size) !important;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: visible;
        }
        /* Price label floats below the circle */
        .vs-cal .vs-price {
          position: absolute;
          top: calc(100% + 2px);
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
          pointer-events: none;
        }
        .vs-cal .rdp-caption { padding-bottom: 12px; }
        .vs-cal .rdp-caption_label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #222;
          letter-spacing: -0.01em;
        }
        .vs-cal .rdp-head_cell {
          font-size: 0.72rem;
          font-weight: 500;
          color: #717171;
          text-transform: capitalize;
        }
        .vs-cal .rdp-day {
          border-radius: 50%;
          font-size: 0.875rem;
          color: #222;
          width: var(--rdp-cell-size);
          height: var(--rdp-cell-size);
          transition: background 0.15s;
        }
        .vs-cal .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled):not(.rdp-day_range_middle) {
          background: #f0f0f0;
          border-radius: 50%;
        }
        .vs-cal .rdp-day_range_start,
        .vs-cal .rdp-day_range_end {
          background: #222222 !important;
          color: white !important;
          font-weight: 600;
        }
        .vs-cal .rdp-day_range_start { border-radius: 50% 0 0 50%; }
        .vs-cal .rdp-day_range_end   { border-radius: 0 50% 50% 0; }
        .vs-cal .rdp-day_range_start.rdp-day_range_end { border-radius: 50%; }
        .vs-cal .rdp-day_range_middle {
          background: #f7f7f7 !important;
          color: #222 !important;
          border-radius: 0;
        }
        .vs-cal .rdp-day_today:not(.rdp-day_selected) { font-weight: 700; color: #0ea5e9; }
        .vs-cal .rdp-day_disabled {
          opacity: 1;
          color: #b0b0b0;
          text-decoration: line-through;
          cursor: not-allowed;
        }
        .vs-cal .rdp-nav_button {
          width: 32px;
          height: 32px;
          border: 1px solid #e0e0e0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .vs-cal .rdp-nav_button:hover { background: #f0f0f0; }
      `}</style>

      <div className="vs-cal bg-white rounded-3xl border border-gray-200 shadow-sm p-4 md:p-6 overflow-x-auto">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {nights > 0
              ? `${nights} ${nights === 1 ? "notte" : "notti"}`
              : "Seleziona le date"}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {range?.from && !range?.to
              ? `Arrivo: ${format(range.from, "d MMM yyyy", { locale: it })} — scegli la partenza`
              : range?.from && range?.to
              ? `${format(range.from, "d MMM", { locale: it })} → ${format(range.to, "d MMM yyyy", { locale: it })}`
              : "Aggiungi le date di arrivo e partenza"}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* DayPicker */}
        <DayPicker
          mode="range"
          selected={range}
          onSelect={handleSelect}
          locale={it}
          numberOfMonths={2}
          month={month}
          onMonthChange={setMonth}
          disabled={[{ before: new Date() }, ...blockedDates]}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
            DayContent: ({ date }) => {
              const key = format(date, "yyyy-MM-dd");
              const price = availMap.get(key)?.price ?? basePrice;
              const color = priceColor(price);
              return (
                <>
                  <span>{date.getDate()}</span>
                  <span className="vs-price" style={{ color }}>
                    {fmtPrice(price)}
                  </span>
                </>
              );
            },
          }}
        />

        {/* Price summary */}
        {nights > 0 && !error && (
          <div className="mt-6 pt-5 border-t flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                €{(totalPrice / nights).toLocaleString("it-IT", { maximumFractionDigits: 0 })} × {nights}{" "}
                {nights === 1 ? "notte" : "notti"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                Totale{" "}
                <span className="text-sea-600">
                  €{totalPrice.toLocaleString("it-IT", { maximumFractionDigits: 0 })}
                </span>
              </p>
              <p className="text-xs text-gray-400">IVA inclusa</p>
            </div>
          </div>
        )}

        {/* Clear button */}
        {(range?.from || range?.to) && (
          <button
            onClick={() => handleSelect(undefined)}
            className="mt-3 text-xs text-gray-400 underline hover:text-gray-600"
          >
            Cancella selezione
          </button>
        )}
      </div>
    </div>
  );
}

