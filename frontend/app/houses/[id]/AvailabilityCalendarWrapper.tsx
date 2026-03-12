"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import BookingForm from "@/components/BookingForm";
import type { House } from "@/lib/api";
import { useLang } from "@/lib/LangContext";

interface Props {
  house: House;
}

export default function AvailabilityCalendarWrapper({ house }: Props) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [calError, setCalError] = useState<string | null>(null);
  const { tr } = useLang();
  const h = tr.house;

  return (
    <div className="grid lg:grid-cols-3 gap-8 border-t pt-10">
      {/* Calendario Airbnb-style – 2/3 */}
      <div className="lg:col-span-2">
        <h2 className="font-serif text-2xl font-semibold text-gray-700 mb-4">{h.availability}</h2>
        <AvailabilityCalendar
          houseId={house.id}
          basePrice={house.base_price}
          onRangeChange={setDateRange}
          onError={setCalError}
        />
      </div>

      {/* Form prenotazione – 1/3 */}
      <div>
        <h2 className="font-serif text-2xl font-semibold text-gray-700 mb-4">{h.book}</h2>
        <BookingForm
          houseId={house.id}
          basePrice={house.base_price}
          dateRange={dateRange}
          blocked={!!calError}
        />
      </div>
    </div>
  );
}
