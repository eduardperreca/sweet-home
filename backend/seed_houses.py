"""
Seed script – adds 3 sample houses with Unsplash cover images and gallery photos.

Run from the backend folder:
  python seed_houses.py
"""

import json
from models.models import House, HouseImage
from models import db
from app import create_app
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))


SAMPLE_HOUSES = [
    {
        "name": "Casa delle Onde",
        "description": (
            "Splendida villetta a schiera a 50 metri dal mare. Due camere da letto, "
            "ampio terrazzo con vista sul mare Adriatico, cucina completamente attrezzata. "
            "Ideale per famiglie fino a 4 persone. A piedi dal centro di Torrette di Fano."
        ),
        "amenities": json.dumps([
            "Wi-Fi", "Aria condizionata", "Parcheggio",
            "TV", "Lavatrice"
        ]),
        "base_price": 120.0,
        "cover_image": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80",
            "https://images.unsplash.com/photo-1560185127-6a26f31c8375?w=1200&q=80",
            "https://images.unsplash.com/photo-1556912173-3bb406ef7e8a?w=1200&q=80",
        ],
    },
    {
        "name": "Villa Adriatica",
        "description": (
            "Elegante villa indipendente con giardino privato a 100 metri dalla spiaggia. "
            "Tre camere da letto, due bagni, cucina spaziosa e zona pranzo esterna. "
            "Perfetta per famiglie o gruppi di amici fino a 6 persone."
        ),
        "amenities": json.dumps([
            "Wi-Fi", "Aria condizionata", "Parcheggio", "Cucina attrezzata",
            "Lavatrice", "TV"
        ]),
        "base_price": 180.0,
        "cover_image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
            "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
        ],
    },
    {
        "name": "Appartamento Azzurro",
        "description": (
            "Accogliente appartamento al primo piano con balcone panoramico. "
            "Camera matrimoniale con letto singolo aggiuntivo, bagno moderno, "
            "angolo cottura. Posizione centrale a 2 minuti dalla spiaggia, "
            "ideale per coppie o famiglie di 3 persone."
        ),
        "amenities": json.dumps([
            "Wi-Fi", "Aria condizionata", "TV", "Lavatrice"
        ]),
        "base_price": 80.0,
        "cover_image": "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80",
        "gallery": [
            "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80",
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
        ],
    },
]


def seed():
    app = create_app()
    with app.app_context():
        existing = House.query.count()
        if existing > 0:
            print(f"[seed] Già presenti {existing} case. Nessuna aggiunta.")
            return

        for data in SAMPLE_HOUSES:
            gallery = data.pop("gallery", [])
            house = House(**data)
            db.session.add(house)
            db.session.flush()  # ottieni house.id prima del commit

            for i, url in enumerate(gallery):
                img = HouseImage(house_id=house.id,
                                 image_url=url, sort_order=i)
                db.session.add(img)

        db.session.commit()
        print(
            f"[seed] {len(SAMPLE_HOUSES)} case di esempio aggiunte con successo!")


if __name__ == "__main__":
    seed()
