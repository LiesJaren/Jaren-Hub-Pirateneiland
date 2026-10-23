# 🏴‍☠️ Jarens Eiland — Piet Piraat Avontuur & Gezinsplanner

> *"Schivermejantjes! Welkom aan boord van het vrolijkste pirateneiland van de zeven zeeën!"*

**Jarens Eiland** is een interactieve, speelse webapplicatie speciaal ontworpen voor **Jaren**. Geïnspireerd door de avonturen van **Piet Piraat** en zijn trouwe bemanning op *De Scheve Schuit* (Berend Brokkenpap, Stien Struis en Steven Stil), combineert het eiland structuur en gezinsplanning met fantasierijke piratengames, leeroefeningen en een sprekende kapitein.

---

## 🌟 Belangrijkste Mogelijkheden

### 🦜 1. Kapitein Piet Piraat AI-Kameraad
- **Interactieve Praatpaal**: Voer echte piratengesprekken met Kapitein Piet Piraat via de server-side Gemini API (`gemini-3.8-flash`).
- **Authentieke Piratenbeleving**: Piet gebruikt zijn bekende uitspraken (*"Schivermejantjes!"*, *"Koers recht vooruit!"*) en vertelt anekdotes over Berend, Stien en Steven.
- **Kindvriendelijk & Veilig**: Kort, bemoedigend en altijd positief.
- **Slimme Offline Fallback**: Mocht er geen internetverbinding of API-sleutel zijn, dan antwoordt Piet nog steeds direct met ingebouwde scheepswijsheden.
- **Audio & Geluidseffecten**: Inclusief piratengeluiden en spraaksynthese voor jonge kinderen.

### 📅 2. Dagplanner & Gezinsagenda
- **Ochtend- & Avondroutines**: Tandenpoetsen, kleren aantrekken, ontbijten en speelgoed opruimen in piratenstijl.
- **Medailles & Gouden Sterren**: Elke afgevinkte taak levert dubloenen en glimmende sterren op.
- **Weekoverzicht**: Duidelijke visuele planning met iconen voor schooldagen, zwemles en avonturentijd.

### 🎮 3. Spelletjes & Leermodules
- **Parelduiker**: Duik in de diepe oceaan om glinsterende oesters en parels op te duiken zonder de krabben te raken.
- **Kombuis & Kennis**: Speelse reken- en taaluitdagingen afgestemd op groep 3 (tellen, letters en piratenwoorden).
- **Flessenpost**: Open aangespoelde flessen met geheime boodschappen en raadsels.
- **Gevoelenskompas**: Een emotie-checkin om te vertellen hoe de wind vandaag in de zeilen staat (blij, boos, moe, avontuurlijk).

### 🏆 4. De Schatkamer & Decorator
- **Schatkist vol Beloningen**: Bewonder verzamelde dubloenen, piratenemblemen en trofeeën.
- **Piraat Jaren Avatar**: Pas het uiterlijk van kapitein Jaren aan met piratenhoeden, ooglapjes en papegaaien.
- **Scheepsdecoratie**: Versier De Scheve Schuit met buitgemaakte vlaggen en schatten.

### 🔒 5. Ouder-gedeelte (Parent Gate)
- Beveiligde toegang voor ouders om taken aan te passen, routines bij te stellen en beloningen te beheren.
- Mogelijkheid om schema's als piratendiploma of PDF te exporteren.

---

## 🛠️ Technische Architectuur

Het project is opgebouwd als een moderne full-stack TypeScript applicatie:

| Laag | Technologie | Beschrijving |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Snelle reactieve componentenstructuur |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Moderne util-first styling met tropisch thema |
| **Animaties & Effecten** | [Motion](https://motion.dev/) & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) | Vloeiende overgangen en feestelijke beloningen |
| **Iconen** | [Lucide React](https://lucide.dev/) | Heldere, herkenbare iconografie |
| **Backend & Server** | [Express](https://expressjs.com/) (`server.ts`) via [tsx](https://github.com/privatenumber/tsx) | Veilige API-proxy met Vite development middlewares |
| **AI Integratie** | [@google/genai SDK](https://www.npmjs.com/package/@google/genai) | Gemini 3.8 Flash model met thinking level LOW & 25s timeout |
| **Dataopslag** | `localStorage` (client) | Voortgang, sterren en taken worden direct bewaard |

---

## 🚀 Aan de Slag

### Vereisten
- **Node.js** versie 18 of hoger
- **npm** (versie 9+)

### 1. Installatie
Installeer alle benodigde afhankelijkheden:
```bash
npm install
```

### 2. Omgevingsvariabelen
Kopieer het voorbeeldbestand of maak een `.env` bestand aan in de hoofdmap:
```bash
cp .env.example .env
```
Voeg je eigen Google Gemini API sleutel toe:
```env
GEMINI_API_KEY="jouw_gemini_api_sleutel_hier"
PORT=3000
```
> *Let op: Als er geen `GEMINI_API_KEY` is ingevuld, schakelt Kapitein Piet automatisch over naar de ingebouwde piraten-antwoorden.*

### 3. Ontwikkelserver Starten
Start de gecombineerde Express + Vite ontwikkelserver op poort 3000:
```bash
npm run dev
```
Open vervolgens [http://localhost:3000](http://localhost:3000) in je browser.

### 4. Productie Build
Bouw de frontend en controleer op typefouten:
```bash
# Typecheck uitvoeren
npm run lint

# Productie bundel genereren
npm run build

# Productieserver starten
npm run start
```

---

## 📁 Mappenstructuur

```text
├── public/                 # Statische bestanden, scheepsiconen en piratenafbeeldingen
├── src/
│   ├── apps/               # Zelfstandige eiland-modules
│   │   ├── checkin/        # Dagelijkse binnenkomst & begroeting
│   │   ├── decorator/      # Schip- en hutdecoratie
│   │   ├── emotions/       # Gevoelenskompas
│   │   ├── home/           # Hoofdkaart van Jarens Eiland
│   │   ├── learning/       # Rekenen & taal in piratenstijl
│   │   ├── parent/         # Ouderportaal met pincode
│   │   ├── piet/           # Directe verbinding met Piet Piraat
│   │   ├── planner/        # Dag- en weekplanner met routines
│   │   ├── story/          # Interactieve verhalen en flessenpost
│   │   ├── theme/          # Thema- en kleurinstellingen
│   │   └── treasure/       # Schatkamer met dubloenen en badges
│   ├── components/         # Herbruikbare UI componenten (Avatar, Shell, Ocean, etc.)
│   ├── platform/           # Audio engine, opslag-hooks en state management
│   ├── App.tsx             # Routering en hoofdnavigatie
│   ├── main.tsx            # React applicatie entrypoint
│   └── index.css           # Tailwind v4 CSS imports en piratenkleuren
├── server.ts               # Express backend & beveiligde /api/piet endpoint
├── metadata.json           # Applicatie-identificatie en permissies
├── package.json            # Scripts en dependencies
└── tsconfig.json           # TypeScript configuratie
```

---

## ⚓ Veiligheid & Privacy

- **Geen API-sleutels in de client**: Alle Gemini AI-verzoeken lopen via de beveiligde Express-backend (`POST /api/piet`).
- **Kindvriendelijk ontwerp**: Geen externe advertenties of tracking.
- **Robuust bij netwerkonderbrekingen**: Alle animaties en spellen werken lokaal; Piet Piraat heeft altijd een bemoedigend woord paraat.

---

*Hijs de zeilen en beleef een fantastisch avontuur op Jarens Eiland!* 🏴‍☠️✨
