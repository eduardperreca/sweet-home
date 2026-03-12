# Villa Silvia – Web App

Applicazione web per la gestione dell'affitto della casa vacanze **Villa Silvia** a Torrette di Fano (Marche, Italia).

---

## Struttura del progetto

```
sweet-home/
├── backend/                   # Flask + SQLite
│   ├── app.py                 # Entry point
│   ├── config.py              # Configurazione (env vars)
│   ├── .env                   # Variabili d'ambiente (non committare in prod)
│   ├── requirements.txt
│   ├── models/
│   │   ├── __init__.py        # db = SQLAlchemy()
│   │   └── models.py          # User, House, HouseImage, Availability, BookingRequest
│   ├── routes/
│   │   ├── public.py          # GET /houses, POST /booking-request
│   │   ├── auth.py            # POST /admin/login
│   │   └── admin.py           # CRUD houses, availability, bookings, images
│   └── services/
│       ├── auth_service.py    # Login, seed admin
│       └── booking_service.py # Creazione e aggiornamento richieste
│
└── frontend/                  # Next.js 14 + TailwindCSS
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx            # Homepage pubblica
    │   ├── houses/[id]/
    │   │   ├── page.tsx        # Pagina casa (stile Airbnb)
    │   │   └── AvailabilityCalendarWrapper.tsx
    │   └── admin/
    │       ├── layout.tsx
    │       ├── page.tsx        # Redirect → /admin/dashboard
    │       ├── AdminShell.tsx  # Sidebar + shell condivisa
    │       ├── login/page.tsx
    │       ├── dashboard/page.tsx
    │       ├── houses/page.tsx
    │       ├── availability/page.tsx
    │       ├── bookings/page.tsx
    │       └── media/page.tsx
    ├── components/
    │   ├── ui/                 # shadcn/ui components
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── HeroSection.tsx
    │   ├── HouseCard.tsx
    │   ├── PhotoGallery.tsx
    │   ├── AvailabilityCalendar.tsx
    │   └── BookingForm.tsx
    └── lib/
        ├── api.ts              # Axios client + tutti gli endpoint
        └── utils.ts            # cn(), formatPrice(), parseAmenities()
```

---

## Avvio in locale

### Prerequisiti

- Python 3.11+
- Node.js 18+

---

### 1 · Backend (Flask)

```bash
cd sweet-home/backend

# Crea e attiva un virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Installa le dipendenze
pip install -r requirements.txt

# Avvia il server (porta 5000)
python app.py
```

Al primo avvio viene creato automaticamente il database SQLite (`villa_silvia.db`) e un utente admin di default:

| Username | Password |
|----------|----------|
| `admin`  | `admin123` |

---

### 2 · Frontend (Next.js)

```bash
cd sweet-home/frontend

# Installa le dipendenze
npm install

# Avvia il server di sviluppo (porta 3000)
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

---

## URL principali

| URL                          | Descrizione                    |
|------------------------------|--------------------------------|
| `http://localhost:3000`      | Homepage pubblica              |
| `http://localhost:3000/houses/1` | Pagina singola casa        |
| `http://localhost:3000/admin/login` | Login admin             |
| `http://localhost:3000/admin/dashboard` | Dashboard            |
| `http://localhost:3000/admin/houses` | Gestione case          |
| `http://localhost:3000/admin/availability` | Calendario prezzi |
| `http://localhost:3000/admin/bookings` | Richieste            |
| `http://localhost:3000/admin/media` | Gestione foto           |

---

## API REST (Backend)

### Pubbliche

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET  | `/api/houses` | Lista case |
| GET  | `/api/houses/:id` | Dettaglio casa |
| GET  | `/api/houses/:id/availability` | Disponibilità |
| POST | `/api/booking-request` | Invia richiesta |

### Admin (JWT required)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST   | `/api/admin/login` | Login |
| GET/POST | `/api/admin/houses` | Lista / crea |
| PUT/DELETE | `/api/admin/houses/:id` | Modifica / elimina |
| POST   | `/api/admin/houses/:id/images` | Upload foto |
| DELETE | `/api/admin/images/:id` | Elimina foto |
| PUT    | `/api/admin/images/reorder` | Riordina foto |
| GET/POST | `/api/admin/houses/:id/availability` | Disponibilità |
| DELETE | `/api/admin/availability/:id` | Elimina record |
| GET    | `/api/admin/booking-requests` | Lista richieste |
| PUT    | `/api/admin/booking-requests/:id/status` | Aggiorna status |

---

## Aggiungere una nuova casa

1. Accedi al pannello admin → **Case** → **Nuova casa**
2. Compila nome, descrizione, dotazioni, prezzo base
3. Carica le foto dalla sezione **Media**
4. Imposta le disponibilità dalla sezione **Disponibilità**

La nuova casa apparirà automaticamente nella homepage pubblica.

---

## Variabili d'ambiente

### Backend (`backend/.env`)

```env
FLASK_ENV=development
SECRET_KEY=cambia-questa-chiave
JWT_SECRET_KEY=cambia-questa-jwt-chiave
DATABASE_URL=sqlite:///villa_silvia.db
UPLOAD_FOLDER=uploads
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Estensioni future

- **SSO Google**: il modello `User` ha già i campi `sso_provider` e `sso_id`; basta aggiungere la route OAuth.
- **Email automatiche**: aggiungi `Flask-Mail` nel backend per inviare conferme automatiche.
- **Pagamenti**: integra Stripe nella pagina di prenotazione.
- **Più case**: il sistema è già predisposto per N case senza modifiche al codice.
