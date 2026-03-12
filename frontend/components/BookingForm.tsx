"use client";

import { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { it } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { submitBookingRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useLang } from "@/lib/LangContext";

interface Props {
  houseId: number;
  basePrice?: number;
  dateRange?: DateRange;
  blocked?: boolean;
}

export default function BookingForm({ houseId, basePrice, dateRange, blocked }: Props) {
  const { tr } = useLang();
  const b = tr.booking;
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const hasDate = !!dateRange?.from;
  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInCalendarDays(dateRange.to, dateRange.from)
      : hasDate ? 1 : 0;
  const total = basePrice && nights > 0 ? nights * basePrice : null;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasDate) return;
    setLoading(true);
    try {
      await submitBookingRequest({
        house_id: houseId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        end_date:   dateRange?.to   ? format(dateRange.to,   "yyyy-MM-dd") : undefined,
        message: form.message,
      });
      setSent(true);
      toast.success(b.toast_ok);
    } catch {
      toast.error(b.toast_err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border bg-sea-50 p-8 text-center">
        <h3 className="font-serif text-xl font-semibold text-sea-700 mb-2">{b.sent_title}</h3>
        <p className="text-gray-500 text-sm">{b.sent_body}</p>
      </div>
    );
  }

  if (!hasDate) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-sea-200 bg-sea-50/50 p-8 text-center space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-sea-100 flex items-center justify-center mx-auto">
          <CalendarDays className="h-6 w-6 text-sea-500" />
        </div>
        <p className="font-semibold text-gray-700">Seleziona le date</p>
        <p className="text-sm text-gray-400 leading-relaxed">
          Scegli il periodo di soggiorno dal calendario per procedere con la richiesta.
        </p>
        {basePrice && (
          <p className="text-xs text-sea-600 font-medium">
            A partire da €{basePrice} / notte
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-white shadow-sm p-6 space-y-4">
      <h3 className="font-serif text-xl font-semibold text-gray-800">{b.title}</h3>

      {/* Date + price summary */}
      <div className="bg-sea-50 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-sea-700">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>{format(dateRange.from!, "d MMM", { locale: it })}</span>
          <ArrowRight className="h-3 w-3 text-sea-400" />
          <span>
            {dateRange.to
              ? format(dateRange.to, "d MMM yyyy", { locale: it })
              : format(dateRange.from!, "d MMM yyyy", { locale: it })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {nights} {nights === 1 ? "notte" : "notti"}
            {basePrice ? ` · €${basePrice}/notte` : ""}
          </span>
          {total !== null && (
            <span className="font-bold text-gray-800 text-base">€{total.toLocaleString("it-IT")}</span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">{b.name}</Label>
          <Input id="name" required value={form.name} onChange={set("name")} placeholder={b.placeholder_name} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">{b.email}</Label>
          <Input id="email" type="email" required value={form.email} onChange={set("email")} placeholder={b.placeholder_email} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">{b.phone}</Label>
        <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} placeholder={b.placeholder_phone} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="message">{b.message}</Label>
        <Textarea id="message" rows={4} value={form.message} onChange={set("message")} placeholder={b.placeholder_msg} />
      </div>

      <Button type="submit" className="w-full" disabled={loading || !!blocked}>
        {loading ? b.sending : b.submit}
      </Button>
    </form>
  );
}
