"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Euro } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { House } from "@/lib/api";
import { formatPrice, imageUrl } from "@/lib/utils";
import { useLang } from "@/lib/LangContext";

interface Props {
  house: House;
}

const COVER_FALLBACKS = [
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
];

export default function HouseCard({ house }: Props) {
  const { tr } = useLang();
  const src = house.cover_image
    ? imageUrl(house.cover_image)
    : COVER_FALLBACKS[house.id % COVER_FALLBACKS.length];

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
      {/* Cover image */}
      <div className="relative h-56 overflow-hidden bg-sea-100">
        <Image
          src={src}
          alt={house.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized={src.startsWith("http")}
        />
      </div>

      <CardContent className="pt-5">
        <h3 className="font-serif text-xl font-semibold text-gray-800 mb-1">{house.name}</h3>
        <div className="flex items-center gap-1 text-sm text-sea-500 mb-3">
          <MapPin className="h-4 w-4" />
          <span>{tr.houses.location}</span>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
          {house.description ?? (tr.houses.location)}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-1 text-sea-600 font-semibold">
          <Euro className="h-4 w-4" />
          <span>{formatPrice(house.base_price)}</span>
          <span className="text-gray-400 font-normal text-sm">{tr.houses.per_night}</span>
        </div>
        <Button asChild size="sm">
          <Link href={`/houses/${house.id}`}>{tr.houses.cta}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
