"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/LangContext";

export default function HeroSection() {
  const { tr } = useLang();
  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(2,132,199,0.55) 0%, rgba(0,0,0,0.3) 100%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80')",
        backgroundSize:  "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* Location pill */}
        <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium mb-6 tracking-wide">
          {tr.hero.location}
        </span>

        <h1 className="font-serif text-6xl md:text-8xl font-bold mb-4 drop-shadow-lg">
          Villa Silvia
        </h1>

        <p className="text-lg md:text-2xl text-white/90 font-light mb-8 leading-relaxed">
          {tr.hero.subtitle}<br />
          {tr.hero.subtitle2}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-sea-600 hover:bg-sea-50 font-semibold shadow-lg border-0">
            <Link href="/#houses">{tr.hero.cta_houses}</Link>
          </Button>
          <Button asChild size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold">
            <Link href="/#contact">{tr.hero.cta_contact}</Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
