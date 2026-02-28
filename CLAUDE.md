# CarteImmoMartinique

## Project Overview
Interactive real estate map for Martinique (French Caribbean), combining public open data (DVF transactions, building permits, natural risks, INSEE demographics, LOVAC vacancy, RPLS social housing) on a single cartographic interface.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 (`@theme inline` syntax)
- **Fonts**: Inter (body), Plus Jakarta Sans (headings), JetBrains Mono (mono)
- **Map**: MapLibre GL JS with CARTO Positron basemap
- **Database**: Supabase (PostgreSQL + PostGIS) — not yet configured (.env.local missing)
- **Hosting**: Vercel

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Main app (requires Supabase)
│   ├── demo/page.tsx         # Self-contained demo with local data (no Supabase needed)
│   ├── comparer/page.tsx     # Commune comparison tool
│   ├── globals.css           # Global styles + animations
│   ├── immobilier/[commune]/ # SEO commune pages
│   └── api/                  # API routes (dvf, risques, permis, annonces, etc.)
├── components/
│   ├── demo/                 # Demo-specific components (Pappers-style UI)
│   │   ├── DemoLeftSidebar.tsx       # Persistent left sidebar (280px, layer toggles + filters)
│   │   ├── DemoRightPanel.tsx        # Right panel with tabbed interface (400px) + mobile variant
│   │   ├── DemoLegend.tsx            # Extracted legend component
│   │   └── DemoMobileLayerSheet.tsx  # Mobile layer overlay sheet
│   ├── layers/               # MapLibre layer components (DvfLayer, RisquesLayer, etc.)
│   ├── map/                  # Map controls (LayerSelector, SearchBar, MapContainer)
│   ├── sidebar/              # Main app sidebar + panel components
│   │   └── panels/           # TransactionPanel, RisquesPanel, PermisPanel, etc.
│   └── ui/                   # Shared UI (Logo, etc.)
├── hooks/                    # useMap, useLayers, useSearch
├── lib/
│   ├── constants.ts          # Map config, zoom thresholds, layer colors
│   ├── demo-data.ts          # Hardcoded demo data (30 DVF, 8 permis, 10 annonces, etc.)
│   ├── format.ts             # Number/date formatting utilities
│   └── supabase.ts           # Supabase client
└── types/
    └── index.ts              # LayerId, SidebarContent, all data interfaces
```

## Key Patterns

### Demo Page Architecture (3-column Pappers-style layout)
```
Desktop: [LeftSidebar 280px] [Map flex-1] [RightPanel 400px (conditional)]
Mobile:  [Map fullscreen] + floating layer button + bottom sheet
```
- Click on any map feature → `handleFeatureSelect()` aggregates ALL data for that commune across all layers
- Filters applied in real-time by updating GeoJSON sources via `source.setData()`
- `map.resize()` called when right panel opens/closes

### Layer System
- 8 layers: dvf, annonces, cadastre, permis, risques, attractivite, vacance, social
- Each layer has a source ID, multiple sub-layer IDs (points, labels, heatmap, etc.)
- Visibility toggled via `map.setLayoutProperty(layerId, 'visibility', 'visible'|'none')`
- Cadastre uses IGN Géoplateforme WMTS raster tiles (public, no API key)

### Types
- `LayerId`: union type of all layer string IDs
- `SidebarContent`: `{ type, title, data: Record<string, unknown> }`
- Panel components all accept `{ data: Record<string, unknown> }` — data shape varies per panel

## Development

```bash
npm run dev        # Start dev server (port 3000)
npx next build     # Type-check + build
```

The `/demo` route works without any environment variables. The main `/` route requires `.env.local` with Supabase credentials.

## Conventions
- Language: French for UI text, English for code/commits
- Commits: short, prefixed (feat:, fix:, docs:, style:)
- No .env.local in repo — all API routes will 500 without Supabase config
- Demo data is self-contained in `src/lib/demo-data.ts`
