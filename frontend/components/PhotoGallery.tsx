"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { imageUrl } from "@/lib/utils";
import type { HouseImage } from "@/lib/api";

interface Props {
  images: HouseImage[];
  houseName: string;
}

export default function PhotoGallery({ images, houseName }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!images.length) return null;

  const prev = () => setLightbox((i) => (i! > 0 ? i! - 1 : images.length - 1));
  const next = () => setLightbox((i) => (i! < images.length - 1 ? i! + 1 : 0));

  return (
    <>
      {/* Grid gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-2xl overflow-hidden">
        {images.slice(0, 6).map((img, idx) => (
          <div
            key={img.id}
            className={`relative cursor-pointer overflow-hidden bg-sea-100 ${
              idx === 0 ? "col-span-2 row-span-2 h-72 md:h-96" : "h-36 md:h-48"
            }`}
            onClick={() => setLightbox(idx)}
          >
            <Image
              src={imageUrl(img.image_url)}
              alt={`${houseName} – foto ${idx + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            {idx === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg">
                +{images.length - 6} foto
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div
            className="relative w-full max-w-4xl mx-4 aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageUrl(images[lightbox].image_url)}
              alt={`${houseName} – foto ${lightbox + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <button
            className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightbox + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
