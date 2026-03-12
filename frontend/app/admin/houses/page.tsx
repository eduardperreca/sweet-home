"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminShell from "../AdminShell";
import {
  adminGetHouses, adminCreateHouse, adminUpdateHouse, adminDeleteHouse,
  adminUploadImage, adminDeleteImage,
} from "@/lib/api";
import type { House } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Upload, X, ExternalLink } from "lucide-react";
import { formatPrice, imageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import ImageDropZone from "@/components/ImageDropZone";
import { AMENITIES } from "@/lib/amenities";

type FormState = {
  name: string;
  description: string;
  amenities: string[];
  base_price: string;
  cover_image: string;
};

const EMPTY: FormState = { name: "", description: "", amenities: [], base_price: "", cover_image: "" };

export default function HousesAdminPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [editing, setEditing] = useState<number | null>(null); // house id being edited
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);

  const load = () => adminGetHouses().then(setHouses).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (h: House) => {
    let parsedAmenities: string[] = [];
    try { parsedAmenities = JSON.parse(h.amenities ?? "[]"); } catch { parsedAmenities = []; }
    setForm({
      name: h.name,
      description: h.description ?? "",
      amenities: parsedAmenities,
      base_price: String(h.base_price),
      cover_image: h.cover_image ?? "",
    });
    setEditing(h.id);
    setShowForm(true);
  };

  const toggleAmenity = (label: string) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(label)
        ? f.amenities.filter((a) => a !== label)
        : [...f.amenities, label],
    }));

  const handleSave = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      amenities: form.amenities as unknown as string,
      base_price: parseFloat(form.base_price) || 0,
      cover_image: form.cover_image || null,
    };
    try {
      if (editing !== null) {
        await adminUpdateHouse(editing, payload);
        toast.success("Casa aggiornata");
      } else {
        await adminCreateHouse(payload);
        toast.success("Casa creata");
      }
      setShowForm(false);
      load();
    } catch {
      toast.error("Errore nel salvataggio");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminare questa casa?")) return;
    try {
      await adminDeleteHouse(id);
      toast.success("Casa eliminata");
      load();
    } catch {
      toast.error("Errore nell'eliminazione");
    }
  };

  const handleUpload = async (houseId: number, file: File) => {
    setUploading(true);
    try {
      await adminUploadImage(houseId, file);
      toast.success("Immagine caricata");
      load();
    } catch {
      toast.error("Errore nel caricamento");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await adminDeleteImage(imageId);
      toast.success("Immagine eliminata");
      load();
    } catch {
      toast.error("Errore");
    }
  };

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-semibold text-gray-800">Case</h1>
          <Button onClick={openNew} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Nuova casa
          </Button>
        </div>

        {/* Form modal (inline) */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-700">
                  {editing !== null ? "Modifica casa" : "Nuova casa"}
                </h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
              </div>

              <div className="space-y-1">
                <Label>Nome</Label>
                <Input value={form.name} onChange={set("name")} placeholder="Casa al Mare" />
              </div>
              <div className="space-y-1">
                <Label>Descrizione</Label>
                <Textarea rows={4} value={form.description} onChange={set("description")} />
              </div>
              <div className="space-y-2">
                <Label>Dotazioni</Label>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {AMENITIES.map(({ label, Icon }) => {
                    const selected = form.amenities.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleAmenity(label)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                          selected
                            ? "bg-sea-500 text-white border-sea-500 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-sea-300 hover:bg-sea-50"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {form.amenities.length > 0 && (
                  <p className="text-xs text-gray-400">
                    Selezionate: {form.amenities.join(", ")}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Prezzo base (€/notte)</Label>
                  <Input type="number" value={form.base_price} onChange={set("base_price")} placeholder="120" />
                </div>
              </div>

              <ImageDropZone
                value={form.cover_image}
                onChange={(url) => setForm((f) => ({ ...f, cover_image: url }))}
              />

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1">Salva</Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Annulla</Button>
              </div>
            </div>
          </div>
        )}

        {/* Houses list */}
        <div className="grid gap-6">
          {houses.length === 0 && (
            <p className="text-center text-gray-400 py-12">Nessuna casa. Creane una!</p>
          )}
          {houses.map((house) => (
            <Card key={house.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Cover */}
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-sea-100">
                    <Image
                      src={imageUrl(house.cover_image)}
                      alt={house.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{house.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mt-0.5">{house.description}</p>
                    <p className="text-sea-600 font-medium mt-1 text-sm">{formatPrice(house.base_price)} / notte</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button size="icon" variant="outline" asChild title="Vedi presentazione pubblica">
                      <Link href={`/houses/${house.id}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => openEdit(house)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(house.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Image gallery management */}
                <div className="mt-5 border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Galleria ({house.images.length} foto)
                    </span>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(house.id, f);
                          e.target.value = "";
                        }}
                      />
                      <Button size="sm" variant="outline" asChild>
                        <span>
                          <Upload className="h-3 w-3 mr-1" />
                          {uploading ? "Caricamento…" : "Carica foto"}
                        </span>
                      </Button>
                    </label>
                  </div>

                  {house.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {house.images.map((img) => (
                        <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                          <Image src={imageUrl(img.image_url)} alt="" fill className="object-cover" sizes="64px" />
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
