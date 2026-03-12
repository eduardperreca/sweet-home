"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Waves } from "lucide-react";
import { useLang } from "@/lib/LangContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { lang, toggle, tr } = useLang();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-sea-100">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-serif text-xl text-sea-600 font-semibold">
          <Waves className="h-6 w-6 text-sea-400" />
          Villa Silvia
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link href="/#houses"  className="hover:text-sea-600 transition-colors">{tr.nav.houses}</Link>
          <Link href="/#about"   className="hover:text-sea-600 transition-colors">{tr.nav.about}</Link>
          <Link href="/#contact" className="hover:text-sea-600 transition-colors">{tr.nav.contact}</Link>
          <button
            onClick={toggle}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-sea-200 text-sea-600 hover:bg-sea-50 transition-colors text-xs font-semibold tracking-wide"
            aria-label="Switch language"
          >
            {lang === "it" ? "EN" : "IT"}
          </button>
        </nav>

        {/* Mobile: language toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggle}
            className="px-2 py-1 rounded-full border border-sea-200 text-sea-600 hover:bg-sea-50 transition-colors text-xs font-semibold"
          >
            {lang === "it" ? "EN" : "IT"}
          </button>
          <button
            className="p-2 text-gray-600"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-sea-100 px-4 pb-4 flex flex-col gap-4 text-sm text-gray-600">
          <Link href="/#houses"  onClick={() => setOpen(false)} className="py-2 hover:text-sea-600">{tr.nav.houses}</Link>
          <Link href="/#about"   onClick={() => setOpen(false)} className="py-2 hover:text-sea-600">{tr.nav.about}</Link>
          <Link href="/#contact" onClick={() => setOpen(false)} className="py-2 hover:text-sea-600">{tr.nav.contact}</Link>
        </div>
      )}
    </header>
  );
}
