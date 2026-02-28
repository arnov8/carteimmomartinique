# CarteImmoMartinique

Carte interactive du marché immobilier en Martinique. Agrège les données publiques ouvertes (DVF, permis de construire, risques naturels, INSEE, logements vacants, parc social) sur une interface cartographique unique.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)
![MapLibre](https://img.shields.io/badge/MapLibre_GL-JS-orange)

## Fonctionnalites

- **8 couches de donnees** : prix immobiliers (DVF), annonces, cadastre parcellaire, permis de construire, risques naturels, attractivite, logements vacants, parc social
- **Layout 3 colonnes** : sidebar gauche (couches + filtres) + carte + panneau droit (donnees detaillees par onglets)
- **Recherche d'adresse** geocodee via API Adresse du gouvernement
- **Filtres en temps reel** : prix au m2, type de bien, decision de permis
- **Responsive** : version mobile avec bottom sheet et overlay de couches
- **Cadastre IGN** : tuiles raster du cadastre parcellaire (zoom 14+)

## Sources de donnees

| Couche | Source | Table Supabase |
|--------|--------|----------------|
| Prix immobiliers | DVF (Demandes de Valeurs Foncieres) | `dvf_transactions` |
| Permis de construire | Sitadel / donnees locales | `permis_construire` |
| Risques naturels | Georisques | `risques_naturels` |
| Annonces | Aggregation annonces locales | `annonces_immobilieres` |
| Logements vacants | LOVAC | `logements_vacants` |
| Parc social | RPLS | `parc_social` |
| Donnees INSEE | INSEE (population, revenus, chomage) | `donnees_insee` |
| Cadastre | IGN Geoplateforme WMTS | Tuiles raster (pas de BDD) |

## Stack technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript (strict)
- **CSS** : Tailwind CSS v4
- **Cartographie** : MapLibre GL JS + CARTO Positron
- **Base de donnees** : Supabase (PostgreSQL + PostGIS)
- **Deploiement** : Vercel

## Installation

```bash
# Cloner le projet
git clone https://github.com/votre-user/carteimmomartinique.git
cd carteimmomartinique

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# Lancer le serveur de developpement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Seed des donnees

Pour peupler la base Supabase avec des donnees d'exemple :

```bash
node scripts/seed.mjs <SUPABASE_SERVICE_ROLE_KEY>
```

Insere des donnees realistes pour les 34 communes de Martinique (87 transactions DVF, 51 risques, 25 permis, 20 annonces, 30 logements vacants, 35 logements sociaux, 30 fiches INSEE).

## Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx            # Page principale (carte + 3 colonnes)
│   ├── comparer/           # Outil de comparaison de communes
│   ├── immobilier/[commune]/ # Pages SEO par commune
│   └── api/                # Routes API (dvf, risques, permis, etc.)
├── components/
│   ├── layout/             # LeftSidebar, RightPanel, Legend, MobileLayerSheet
│   ├── layers/             # Composants MapLibre (DvfLayer, CadastreLayer, etc.)
│   ├── map/                # MapContainer, SearchBar
│   └── sidebar/panels/     # Panneaux de details (TransactionPanel, etc.)
├── hooks/                  # useMap, useLayers, useSearch
├── lib/                    # Constantes, formatage, clients Supabase
└── types/                  # Types TypeScript
```

## Deploiement

```bash
npx next build    # Build de production
```

Deployer sur [Vercel](https://vercel.com) en connectant le repo GitHub. Configurer les variables d'environnement Supabase dans les settings du projet Vercel.

## Licence

MIT
