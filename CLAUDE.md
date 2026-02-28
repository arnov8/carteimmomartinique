# CarteImmoMartinique

## Project Overview
Interactive real estate map for Martinique (French Caribbean), combining public open data (DVF transactions, building permits, natural risks, INSEE demographics, LOVAC vacancy, RPLS social housing) on a single cartographic interface with a 3-column Pappers-style layout.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 (`@theme inline` syntax)
- **Fonts**: Inter (body), Plus Jakarta Sans (headings), JetBrains Mono (mono)
- **Map**: MapLibre GL JS with CARTO Positron basemap
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Hosting**: Vercel

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Main app (3-column layout)
│   ├── comparer/page.tsx     # Commune comparison tool
│   ├── globals.css           # Global styles + animations
│   ├── immobilier/[commune]/ # SEO commune pages
│   ├── adresse/[commune]/[adresse]/ # Address detail pages
│   └── api/                  # API routes (dvf, risques, permis, annonces, insee, lovac, social)
├── components/
│   ├── layout/               # App layout components (Pappers-style UI)
│   │   ├── LeftSidebar.tsx   # Persistent left sidebar (380px, layer toggles + filters)
│   │   ├── RightPanel.tsx    # Right panel with tabbed interface (400px) + mobile variant
│   │   ├── Legend.tsx        # Conditional legend component
│   │   └── MobileLayerSheet.tsx # Mobile layer overlay sheet
│   ├── layers/               # MapLibre layer components (DvfLayer, RisquesLayer, CadastreLayer, etc.)
│   ├── map/                  # Map controls (SearchBar, MapContainer)
│   ├── sidebar/
│   │   └── panels/           # TransactionPanel, RisquesPanel, PermisPanel, etc.
│   └── ui/                   # Shared UI (Logo, etc.)
├── hooks/                    # useMap, useLayers, useSearch
├── lib/
│   ├── constants.ts          # Map config, zoom thresholds, layer colors, communes list
│   ├── format.ts             # Number/date formatting utilities
│   ├── supabase.ts           # Supabase browser client
│   └── supabase-server.ts    # Supabase server client (for API routes)
├── types/
│   └── index.ts              # LayerId, SidebarContent, MapViewState, all data interfaces
└── scripts/
    └── seed.mjs              # Seed script for Supabase (requires service_role key)
```

## Architecture

### 3-Column Layout
```
Desktop: [LeftSidebar 380px] [Map flex-1] [RightPanel 400px (conditional)]
Mobile:  [Map fullscreen] + floating layer button + bottom sheet
```

### Data Flow
1. Layer components (in `src/components/layers/`) each manage their own MapLibre sources and fetch from API routes
2. Click on any map feature → `handleFeatureClick()` fetches complementary data via API for that commune
3. RightPanel displays all aggregated data across 8 tabs
4. Filters applied in LeftSidebar update layer components via props

### Layer System
- 8 layers: dvf, annonces, cadastre, permis, risques, attractivite, vacance, social
- Each layer is a React component that manages its own MapLibre source/layers
- Visibility toggled via `map.setLayoutProperty(layerId, 'visibility', 'visible'|'none')`
- Cadastre uses IGN Géoplateforme WMTS raster tiles (public, no API key needed)
- DVF/Permis/Annonces fetch from Supabase via bounding box queries
- Risques/Vacance/Social/Attractivite fetch aggregate data by commune

### Types
- `LayerId`: union type of all 8 layer string IDs + "plu"
- `SidebarContent`: `{ type, title, data: Record<string, unknown> }`
- `SelectedFeature`: aggregated data for all tabs when a feature is clicked
- `TabCounts`: badge counts for each tab in the right panel

## Development

```bash
npm run dev          # Start dev server (port 3000)
npx next build       # Type-check + build
node scripts/seed.mjs <service_role_key>  # Seed Supabase with sample data
```

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Conventions
- Language: French for UI text, English for code/commits
- Commits: short, prefixed (feat:, fix:, docs:, style:)
- No secrets in repo — all API routes will 500 without Supabase config
- INSEE commune codes verified against official source (97201–97234)
