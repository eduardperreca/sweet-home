"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import AdminShell from "../AdminShell";
import {
  adminGetHouses,
  adminUploadImage,
  adminDeleteImage,
  adminReorderImages,
} from "@/lib/api";
import type { House, HouseImage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Upload, X, ArrowUp, ArrowDown } from "lucide-react";
import { imageUrl } from "@/lib/utils";

export default function MediaAdminPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [houseId, setHouseId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = () =>
    adminGetHouses().then((hs) => {
      setHouses(hs);
      if (hs.length && !houseId) setHouseId(hs[0].id);
    });

  useEffect(() => { load(); }, []);

  const house = houses.find((h) => h.id === houseId);
  const images = house?.images ?? [];

  const handleUpload = async (file: File) => {
    if (!houseId) return;
    setUploading(true);
    try {
      await adminUploadImage(houseId, file);
      toast.success("Foto caricata");
      load();
    } catch {
      toast.error("Errore nel caricamento");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminare questa foto?")) return;
    try {
      await adminDeleteImage(id);
      toast.success("Foto eliminata");
      load();
    } catch {
      toast.error("Errore");
    }
  };

  const move = async (img: HouseImage, dir: -1 | 1) => {
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((i) => i.id === img.id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sorted.length) return;

    // Swap sort orders
    const updated = sorted.map((im, i) => ({
      id: im.id,
      sort_order:
        i === idx    ? sorted[newIdx].sort_order :
        i === newIdx ? sorted[idx].sort_order    : im.sort_order,
    }));

    try {
      await adminReorderImages(updated);
      load();
    } catch {
      toast.error("Errore nel riordinamento");
    }
  };

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-2xl font-semibold text-gray-800 mb-6">Gestione Media</h1>

        {/* House tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {houses.map((h) => (
            <button
              key={h.id}
              onClick={() => setHouseId(h.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                houseId === h.id
                  ? "bg-sea-500 text-white border-sea-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-sea-300"
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>

        {house && (
          <>
            {/* Upload button */}
            <label className="cursor-pointer mb-4 block">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  files.forEach((f) => handleUpload(f));
                  e.target.value = "";
                }}
              />
              <Button variant="outline" asChild disabled={uploading}>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Caricamento…" : "Carica foto"}
                </span>
              </Button>
            </label>

            {/* Image grid */}
            {images.length === 0 ? (
              <p className="text-gray-400 text-sm">Nessuna foto caricata.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...images]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((img) => (
                    <div key={img.id} className="group relative rounded-xl overflow-hidden border bg-sea-50 aspect-square">
                      <Image
                        src={imageUrl(img.image_url)}
                        alt="foto"
                        fill
                        className="object-cover"
                        sizes="200px"
                      />

                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => move(img, -1)}
                            className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white"
                            title="Sposta prima"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => move(img, 1)}
                            className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white"
                            title="Sposta dopo"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleDelete(img.id)}
                          className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded text-white"
                          title="Elimina"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Order badge */}
                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                        #{img.sort_order + 1}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}
