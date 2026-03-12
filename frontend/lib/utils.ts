import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes safely (used by shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a price in euros. */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/** Parses the amenities JSON string into an array. */
export function parseAmenities(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Returns the full URL for an uploaded image. */
export function imageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-house.jpg";
  if (path.startsWith("http")) return path;
  return path; // relative – Next.js rewrites handle /uploads/*
}
