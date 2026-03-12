import {
  Wifi,
  Car,
  Wind,
  Tv,
  Waves,
  ChefHat,
  ShowerHead,
  Baby,
  WashingMachine,
  Flame,
  TreeDeciduous,
  Bike,
  PawPrint,
  CarFront,
  Anchor,
  Utensils,
  Umbrella,
  Dumbbell,
} from "lucide-react";

export interface AmenityDef {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const AMENITIES: AmenityDef[] = [
  { label: "Wi-Fi",             Icon: Wifi },
  { label: "Parcheggio",        Icon: Car },
  { label: "Aria condizionata", Icon: Wind },
  { label: "TV",                Icon: Tv },
  { label: "Spiaggia privata",  Icon: Waves },
  { label: "Cucina attrezzata", Icon: ChefHat },
  { label: "Doccia esterna",    Icon: ShowerHead },
  { label: "Culla/lettino",     Icon: Baby },
  { label: "Lavatrice",         Icon: WashingMachine },
  { label: "Lavastoviglie",     Icon: Utensils },
  { label: "Barbecue",          Icon: Flame },
  { label: "Giardino",          Icon: TreeDeciduous },
  { label: "Biciclette",        Icon: Bike },
  { label: "Animali ammessi",   Icon: PawPrint },
  { label: "Taxi privato",      Icon: CarFront },
  { label: "Canotto/Kayak",     Icon: Anchor },
  { label: "Ombrellone incluso",Icon: Umbrella },
  { label: "Palestra",          Icon: Dumbbell },
];

/** Ricerca flessibile: case-insensitive, ignora trattini e spazi */
export function getAmenityDef(label: string): AmenityDef | undefined {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[-\s/]/g, "");
  return AMENITIES.find((a) => normalize(a.label) === normalize(label));
}
