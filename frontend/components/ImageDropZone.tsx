"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { adminUploadTemp } from "@/lib/api";
import { imageUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  value: string; // current URL
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageDropZone({ value, onChange, label = "Immagine copertina" }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setUploading(true);
      try {
        const { url } = await adminUploadTemp(file);
        onChange(url);
      } catch {
        // silent – caller can add toast if needed
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {value ? (
        /* Preview */
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 group">
          <Image
            src={imageUrl(value)}
            alt="Copertina"
            fill
            className="object-cover"
            sizes="400px"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
            dragging
              ? "border-sea-400 bg-sea-50"
              : "border-gray-200 hover:border-sea-300 hover:bg-gray-50"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="h-6 w-6 border-2 border-sea-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Caricamento…</span>
            </div>
          ) : (
            <>
              {dragging ? (
                <ImageIcon className="h-7 w-7 text-sea-400" />
              ) : (
                <Upload className="h-7 w-7 text-gray-300" />
              )}
              <p className="text-xs text-gray-400 text-center px-4">
                {dragging
                  ? "Rilascia per caricare"
                  : "Trascina qui l'immagine o clicca per scegliere"}
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
