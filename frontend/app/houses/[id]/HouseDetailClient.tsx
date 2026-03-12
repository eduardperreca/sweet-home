"use client";

import { CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/LangContext";
import { getAmenityDef } from "@/lib/amenities";
import { formatPrice } from "@/lib/utils";
import type { House } from "@/lib/api";
import { parseAmenities } from "@/lib/utils";

const DEFAULT_DESCRIPTION_IT = `Una splendida villa sul mare Adriatico, immersa nel verde delle Marche.
Pochi passi vi separano dalla battigia: svegliatevi con il profumo del salmastro e addormentatevi con il suono delle onde.
Grandi spazi, luce naturale in abbondanza e ogni comfort moderno per una vacanza indimenticabile in famiglia o tra amici.`;

const DEFAULT_DESCRIPTION_EN = `A stunning villa on the Adriatic Sea, nestled among the green hills of Le Marche.
Just a few steps from the shore: wake up to the scent of the sea and fall asleep to the sound of the waves.
Spacious rooms, natural light in abundance, and every modern comfort for an unforgettable holiday with family or friends.`;

interface Props {
  house: House;
}

export default function HouseDetailClient({ house }: Props) {
  const { lang, tr } = useLang();
  const h = tr.house;
  const amenities = parseAmenities(house.amenities);

  const description =
    house.description && house.description.trim().length > 10
      ? house.description
      : lang === "it"
      ? DEFAULT_DESCRIPTION_IT
      : DEFAULT_DESCRIPTION_EN;

  return (
    <div className="grid lg:grid-cols-3 gap-10 mb-10">
      <div className="lg:col-span-2 space-y-8">
        {/* Description */}
        <section>
          <h2 className="font-serif text-2xl font-semibold text-gray-800 mb-3">{h.about}</h2>
          <p className="text-gray-500 leading-relaxed whitespace-pre-line text-[15px]">
            {description}
          </p>
        </section>

        {/* Amenities */}
        {amenities.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-semibold text-gray-800 mb-4">{h.amenities}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {amenities.map((a) => {
                const def = getAmenityDef(a);
                const Icon = def?.Icon ?? CheckCircle2;
                return (
                  <div
                    key={a}
                    className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm hover:shadow-md hover:border-sea-200 transition-all"
                  >
                    <Icon className="h-4 w-4 text-sea-500 shrink-0" />
                    <span className="truncate">{a}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Price card */}
      <div>
        <div className="rounded-2xl border shadow-md p-6 bg-white sticky top-24 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sea-400 to-sea-600" />
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatPrice(house.base_price)}
            <span className="text-base font-normal text-gray-400"> {h.per_night}</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">{h.price_subtitle}</p>
        </div>
      </div>
    </div>
  );
}
