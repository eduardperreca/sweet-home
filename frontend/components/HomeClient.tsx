"use client";

import { Sun, Waves, UtensilsCrossed, Shell } from "lucide-react";
import HouseCard from "@/components/HouseCard";
import type { House } from "@/lib/api";
import { useLang } from "@/lib/LangContext";

interface Props {
  houses: House[];
}

export default function HomeClient({ houses }: Props) {
  const { tr } = useLang();

  return (
    <>
      {/* ── About / Description ──────────────── */}
      <section id="about" className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-4xl font-semibold text-gray-800 mb-6">
          {tr.about.title}
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed mb-12">
          {tr.about.body}
        </p>

        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <Waves className="h-8 w-8 text-sea-400" />,       ...tr.about.features[0] },
            { icon: <Sun className="h-8 w-8 text-sand-400" />,         ...tr.about.features[1] },
            { icon: <UtensilsCrossed className="h-8 w-8 text-terracotta-500" />, ...tr.about.features[2] },
            { icon: <Shell className="h-8 w-8 text-sea-300" />,        ...tr.about.features[3] },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-2">
              {f.icon}
              <span className="font-semibold text-gray-700">{f.title}</span>
              <span className="text-sm text-gray-400">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Houses ───────────────────────────── */}
      <section id="houses" className="bg-sea-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-semibold text-gray-800 mb-3">
              {tr.houses.title}
            </h2>
            <p className="text-gray-500">{tr.houses.subtitle}</p>
          </div>

          {houses.length === 0 ? (
            <p className="text-center text-gray-400 py-12">{tr.houses.empty}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {houses.map((house) => (
                <HouseCard key={house.id} house={house} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────── */}
      <section id="contact" className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-4xl font-semibold text-gray-800 mb-4">
          {tr.contact.title}
        </h2>
        <p className="text-gray-500 mb-8">{tr.contact.body}</p>
        <a
          href="mailto:info@villasilvia.it"
          className="inline-block bg-sea-500 hover:bg-sea-600 text-white font-medium px-8 py-3 rounded-xl transition-colors shadow-md"
        >
          {tr.contact.cta}
        </a>
      </section>
    </>
  );
}
