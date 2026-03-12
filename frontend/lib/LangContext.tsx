"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { translations, type Lang } from "./i18n";

interface LangContextType {
  lang: Lang;
  toggle: () => void;
  tr: typeof translations["it"];
}

const LangContext = createContext<LangContextType>({
  lang: "it",
  toggle: () => {},
  tr: translations["it"],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("it");
  const toggle = () => setLang((l) => (l === "it" ? "en" : "it"));

  return (
    <LangContext.Provider value={{ lang, toggle, tr: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
