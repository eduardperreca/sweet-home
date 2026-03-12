import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Villa Silvia – Torrette di Fano",
  description:
    "Trascorri le tue vacanze estive in riva al mare Adriatico nella splendida Villa Silvia a Torrette di Fano, Marche.",
  openGraph: {
    title: "Villa Silvia",
    description: "Estate italiana al mare, Torrette di Fano (Marche)",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
