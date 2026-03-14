"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { translations, type Lang } from "./i18n";

type Translations = typeof translations["it"];

interface LangContextType {
  lang: Lang;
  toggle: () => void;
  tr: Translations;
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
    <LangContext.Provider value={{ lang, toggle, tr: translations[lang] as Translations }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
