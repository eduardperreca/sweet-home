import { notFound } from "next/navigation";
import { getHouse } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotoGallery from "@/components/PhotoGallery";
import AvailabilityCalendarWrapper from "./AvailabilityCalendarWrapper";
import HouseDetailClient from "./HouseDetailClient";

export default async function HousePage({
  params,
}: {
  params: { id: string };
}) {
  let house;
  try {
    house = await getHouse(Number(params.id));
  } catch {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-4xl font-bold text-gray-800">{house.name}</h1>
          <p className="text-sea-500 mt-1 text-sm">Torrette di Fano, Marche, Italia</p>
        </div>

        {/* Gallery o placeholder */}
        {house.images.length > 0 ? (
          <div className="mb-10">
            <PhotoGallery images={house.images} houseName={house.name} />
          </div>
        ) : (
          <div className="mb-10 w-full h-72 md:h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-sea-100 to-sea-200 flex items-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80"
              alt={house.name}
              className="w-full h-full object-cover mix-blend-overlay absolute inset-0"
              style={{ position: "relative" }}
            />
            <div className="w-full px-8 pb-8 bg-gradient-to-t from-black/50 to-transparent">
              <p className="text-white/80 text-sm">Foto non ancora disponibile</p>
            </div>
          </div>
        )}

        {/* Description + amenities + price card (uses translations client-side) */}
        <HouseDetailClient house={house} />

        {/* Calendar + Booking Form a piena larghezza (client component condivide lo stato) */}
        <AvailabilityCalendarWrapper house={house} />
      </main>
      <Footer />
    </>
  );
}
