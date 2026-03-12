"use client";

import Link from "next/link";
import { Waves } from "lucide-react";
import { useLang } from "@/lib/LangContext";

export default function Footer() {
  const { tr } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-sea-600 text-white mt-24">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-serif text-xl font-semibold mb-3">
            <Waves className="h-5 w-5" />
            Villa Silvia
          </div>
          <p className="text-sea-200 text-sm leading-relaxed">
            {tr.footer.tagline}<br />
            {tr.footer.tagline2}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">{tr.footer.links_title}</h3>
          <ul className="space-y-2 text-sea-200 text-sm">
            <li><Link href="/#houses"  className="hover:text-white transition-colors">{tr.footer.links[0]}</Link></li>
            <li><Link href="/#about"   className="hover:text-white transition-colors">{tr.footer.links[1]}</Link></li>
            <li><Link href="/#contact" className="hover:text-white transition-colors">{tr.footer.links[2]}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">{tr.footer.contact_title}</h3>
          <p className="text-sea-200 text-sm leading-relaxed">
            {tr.footer.contact_body}
          </p>
        </div>
      </div>
      <div className="border-t border-sea-500 text-center text-xs text-sea-300 py-4">
        © {year} Villa Silvia · {tr.footer.rights}
      </div>
    </footer>
  );
}
