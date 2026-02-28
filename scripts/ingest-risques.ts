/**
 * Script d'ingestion Risques Naturels
 *
 * Récupère les données de risques naturels pour la Martinique via :
 * - API Géorisques (https://www.georisques.gouv.fr/api)
 * - Données PPR sur data.gouv.fr
 *
 * Les risques couverts : sismique, inondation, mouvement de terrain,
 * submersion marine, volcanique (Montagne Pelée).
 *
 * Usage: npx tsx scripts/ingest-risques.ts
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import path from "path";
import { supabaseAdmin } from "./lib/supabase-admin.js";
import { log, logError, logProgress } from "./lib/logger.js";

const SOURCE = "RISQUES";
const DATA_DIR = path.resolve(process.cwd(), "scripts/data");
const BATCH_INSERT_SIZE = 100;

// API Géorisques
const GEORISQUES_API = "https://www.georisques.gouv.fr/api/v1";

// Codes commune Martinique (972xxx)
const DEPT_CODE = "972";

interface GeorisquesRisque {
  code_national_risque: string;
  libelle_risque_long: string;
  num_risque: string;
}

interface PPRFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: unknown;
  };
  properties: Record<string, unknown>;
}

interface RisqueRow {
  commune: string;
  type_risque: string;
  niveau: string;
  description: string;
  source: string;
  geom?: string;
}

// Mapping des codes risques Géorisques vers nos types
const RISQUE_TYPE_MAP: Record<string, string> = {
  "13": "sismique",
  "14": "volcanique",
  "11": "inondation",
  "12": "mouvement_terrain",
  "15": "submersion_marine",
  // Codes secondaires
  INONDATION: "inondation",
  SISMIQUE: "sismique",
  MOUVEMENT_TERRAIN: "mouvement_terrain",
  SUBMERSION: "submersion_marine",
  VOLCANIQUE: "volcanique",
};

// Données sismiques connues pour la Martinique (zone 5 - forte)
const SISMIQUE_DATA: RisqueRow[] = [
  {
    commune: "Fort-de-France",
    type_risque: "sismique",
    niveau: "tres_fort",
    description:
      "Zone de sismicité 5 (forte). La Martinique est située sur la zone de subduction des plaques Caraïbes et Amérique du Nord.",
    source: "Décret n°2010-1255 - Zonage sismique national",
  },
];

/**
 * Récupère la liste des risques par commune via l'API Géorisques
 */
async function fetchRisquesParCommune(): Promise<RisqueRow[]> {
  log(SOURCE, "Récupération des risques par commune via API Géorisques...");

  const rows: RisqueRow[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const params = new URLSearchParams({
        rayon: "1",
        page: String(page),
        page_size: "50",
        code_departement: DEPT_CODE,
      });

      const res = await fetch(
        `${GEORISQUES_API}/resultats_rapport_risque?${params}`
      );

      if (!res.ok) {
        // Essayer l'endpoint gaspar
        break;
      }

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        hasMore = false;
        break;
      }

      for (const result of data.results) {
        const commune = result.libelle_commune || result.commune || "";
        if (!commune) continue;

        for (const risque of result.risques_naturels || []) {
          const typeRisque =
            RISQUE_TYPE_MAP[risque.num_risque] ||
            RISQUE_TYPE_MAP[risque.code_national_risque] ||
            null;

          if (!typeRisque) continue;

          rows.push({
            commune,
            type_risque: typeRisque,
            niveau: mapNiveau(risque),
            description:
              risque.libelle_risque_long || risque.libelle_risque || "",
            source: "API Géorisques",
          });
        }
      }

      page++;
      if (page > 20) hasMore = false; // Safety limit

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      logError(SOURCE, `Erreur page ${page}`, err);
      hasMore = false;
    }
  }

  log(SOURCE, `${rows.length} entrées de risques récupérées via API`);
  return rows;
}

/**
 * Fallback: récupérer les risques via l'endpoint GASPAR de Géorisques
 */
async function fetchRisquesGaspar(): Promise<RisqueRow[]> {
  log(SOURCE, "Récupération via endpoint GASPAR...");

  const rows: RisqueRow[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const params = new URLSearchParams({
        code_departement: DEPT_CODE,
        page: String(page),
        page_size: "20",
      });

      const res = await fetch(`${GEORISQUES_API}/gaspar/risques?${params}`);

      if (!res.ok) {
        log(SOURCE, `GASPAR HTTP ${res.status}, arrêt`);
        break;
      }

      const data = await res.json();
      const results = data.data || data.results || [];

      if (results.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of results) {
        const commune = item.libelle_commune || "";
        const codeNat = item.cod_nat_risq || "";
        const typeRisque = mapCodeToType(codeNat);

        if (!typeRisque || !commune) continue;

        rows.push({
          commune,
          type_risque: typeRisque,
          niveau: "fort", // GASPAR ne fournit pas toujours le niveau
          description: item.lib_risq_jo || item.libelle_risque || codeNat,
          source: "GASPAR / Géorisques",
        });
      }

      page++;
      if (page > 50) hasMore = false;
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      logError(SOURCE, `Erreur GASPAR page ${page}`, err);
      hasMore = false;
    }
  }

  log(SOURCE, `${rows.length} entrées GASPAR récupérées`);
  return rows;
}

/**
 * Ajouter les données sismiques connues pour toute la Martinique
 * La Martinique entière est en zone 5 (sismicité forte)
 */
function getStaticRisques(): RisqueRow[] {
  const communes = [
    "L'Ajoupa-Bouillon", "Les Anses-d'Arlet", "Basse-Pointe", "Bellefontaine",
    "Le Carbet", "Case-Pilote", "Le Diamant", "Ducos", "Fonds-Saint-Denis",
    "Fort-de-France", "Le François", "Grand'Rivière", "Gros-Morne",
    "Le Lamentin", "Le Lorrain", "Macouba", "Le Marigot", "Le Marin",
    "Le Morne-Rouge", "Le Morne-Vert", "Le Prêcheur", "Rivière-Pilote",
    "Rivière-Salée", "Le Robert", "Saint-Esprit", "Saint-Joseph",
    "Saint-Pierre", "Sainte-Anne", "Sainte-Luce", "Sainte-Marie",
    "Schœlcher", "Les Trois-Îlets", "La Trinité", "Le Vauclin",
  ];

  const rows: RisqueRow[] = [];

  // Toute la Martinique : sismicité zone 5
  for (const commune of communes) {
    rows.push({
      commune,
      type_risque: "sismique",
      niveau: "tres_fort",
      description:
        "Zone de sismicité 5 (forte). L'ensemble de la Martinique est classé en zone de sismicité forte.",
      source: "Décret n°2010-1255",
    });
  }

  // Communes proches de la Montagne Pelée : risque volcanique
  const communesVolcaniques = [
    "Saint-Pierre", "Le Prêcheur", "Le Morne-Rouge", "L'Ajoupa-Bouillon",
    "Grand'Rivière", "Macouba", "Basse-Pointe", "Le Carbet",
    "Fonds-Saint-Denis", "Le Morne-Vert",
  ];
  for (const commune of communesVolcaniques) {
    rows.push({
      commune,
      type_risque: "volcanique",
      niveau: commune === "Saint-Pierre" || commune === "Le Prêcheur" ? "tres_fort" : "fort",
      description:
        "Proximité de la Montagne Pelée (volcan actif). Risque éruptif et lahars.",
      source: "BRGM / Observatoire Volcanologique de la Montagne Pelée",
    });
  }

  // Communes côtières : submersion marine
  const communesCotieres = [
    "Fort-de-France", "Le Lamentin", "Les Trois-Îlets", "Les Anses-d'Arlet",
    "Le Diamant", "Sainte-Luce", "Le Marin", "Sainte-Anne", "Le Vauclin",
    "Le François", "Le Robert", "La Trinité", "Sainte-Marie", "Le Lorrain",
    "Basse-Pointe", "Grand'Rivière", "Le Prêcheur", "Saint-Pierre",
    "Le Carbet", "Case-Pilote", "Bellefontaine", "Schœlcher", "Macouba",
  ];
  for (const commune of communesCotieres) {
    rows.push({
      commune,
      type_risque: "submersion_marine",
      niveau: "moyen",
      description:
        "Commune littorale exposée au risque de submersion marine (tsunami, houle cyclonique).",
      source: "DEAL Martinique / PPR Littoral",
    });
  }

  // Communes à risque inondation
  const communesInondation = [
    "Fort-de-France", "Le Lamentin", "Ducos", "Rivière-Salée",
    "Le François", "Le Robert", "La Trinité", "Gros-Morne",
    "Saint-Joseph", "Rivière-Pilote", "Le Marin",
  ];
  for (const commune of communesInondation) {
    rows.push({
      commune,
      type_risque: "inondation",
      niveau: commune === "Fort-de-France" || commune === "Le Lamentin" ? "fort" : "moyen",
      description:
        "Risque d'inondation par débordement de cours d'eau ou ruissellement urbain.",
      source: "PPR Inondation / DEAL Martinique",
    });
  }

  // Mouvement de terrain (mornes, reliefs)
  const communesMouvements = [
    "Fort-de-France", "Saint-Pierre", "Le Morne-Rouge", "Gros-Morne",
    "Le Carbet", "Fonds-Saint-Denis", "Le Prêcheur", "Case-Pilote",
    "Bellefontaine", "Schœlcher", "Saint-Joseph",
  ];
  for (const commune of communesMouvements) {
    rows.push({
      commune,
      type_risque: "mouvement_terrain",
      niveau: "moyen",
      description:
        "Risque de glissement de terrain, éboulement ou effondrement lié au relief accidenté.",
      source: "BRGM / PPR Mouvement de terrain",
    });
  }

  log(SOURCE, `${rows.length} entrées de risques statiques générées`);
  return rows;
}

function mapCodeToType(code: string): string | null {
  const normalized = code.toUpperCase().trim();
  if (normalized.includes("INOND")) return "inondation";
  if (normalized.includes("SISM")) return "sismique";
  if (normalized.includes("VOLCAN")) return "volcanique";
  if (normalized.includes("MOUV") || normalized.includes("TERRAIN"))
    return "mouvement_terrain";
  if (normalized.includes("SUBMER") || normalized.includes("LITOR"))
    return "submersion_marine";
  return RISQUE_TYPE_MAP[code] || null;
}

function mapNiveau(risque: Record<string, unknown>): string {
  const niveau = String(risque.niveau || risque.niveau_alea || "").toLowerCase();
  if (niveau.includes("tres") || niveau.includes("très") || niveau.includes("4"))
    return "tres_fort";
  if (niveau.includes("fort") || niveau.includes("3")) return "fort";
  if (niveau.includes("moyen") || niveau.includes("2")) return "moyen";
  if (niveau.includes("faibl") || niveau.includes("1")) return "faible";
  return "moyen"; // Default
}

async function deduplicateAndInsert(rows: RisqueRow[]): Promise<void> {
  // Dédupliquer par commune + type_risque (garder le niveau le plus élevé)
  const niveauOrder: Record<string, number> = {
    faible: 1,
    moyen: 2,
    fort: 3,
    tres_fort: 4,
  };

  const map = new Map<string, RisqueRow>();
  for (const row of rows) {
    const key = `${row.commune}::${row.type_risque}`;
    const existing = map.get(key);
    if (
      !existing ||
      (niveauOrder[row.niveau] || 0) > (niveauOrder[existing.niveau] || 0)
    ) {
      map.set(key, row);
    }
  }

  const deduplicated = Array.from(map.values());
  log(
    SOURCE,
    `${deduplicated.length} entrées après déduplication (${rows.length} avant)`
  );

  // Vider la table avant d'insérer
  const { error: deleteError } = await supabaseAdmin
    .from("risques_naturels")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

  if (deleteError) {
    logError(SOURCE, "Erreur suppression anciens risques", deleteError);
  }

  let inserted = 0;
  for (let i = 0; i < deduplicated.length; i += BATCH_INSERT_SIZE) {
    const batch = deduplicated.slice(i, i + BATCH_INSERT_SIZE);

    const { error } = await supabaseAdmin.from("risques_naturels").insert(
      batch.map((r) => ({
        commune: r.commune,
        type_risque: r.type_risque,
        niveau: r.niveau,
        description: r.description,
        source: r.source,
      }))
    );

    if (error) {
      logError(SOURCE, `Erreur batch ${i}`, error);
    } else {
      inserted += batch.length;
    }

    logProgress(
      SOURCE,
      Math.min(i + BATCH_INSERT_SIZE, deduplicated.length),
      deduplicated.length
    );
  }

  log(SOURCE, `✅ ${inserted} risques insérés`);
}

// --- Main ---
async function main() {
  console.log("\n⚠️  CarteImmoMartinique - Ingestion Risques Naturels\n");

  try {
    // 1. Récupérer via API Géorisques
    let apiRows = await fetchRisquesParCommune();

    // 2. Fallback GASPAR si peu de résultats
    if (apiRows.length < 10) {
      const gasparRows = await fetchRisquesGaspar();
      apiRows = [...apiRows, ...gasparRows];
    }

    // 3. Compléter avec les données statiques connues
    const staticRows = getStaticRisques();
    const allRows = [...apiRows, ...staticRows];

    // 4. Dédupliquer et insérer
    await deduplicateAndInsert(allRows);

    // 5. Logger
    await supabaseAdmin.from("sync_logs").insert({
      source: "RISQUES",
      status: "success",
      nb_added: allRows.length,
      finished_at: new Date().toISOString(),
    });

    console.log(`\n✅ Ingestion Risques terminée\n`);
  } catch (err) {
    logError(SOURCE, "Erreur fatale", err);
    await supabaseAdmin.from("sync_logs").insert({
      source: "RISQUES",
      status: "error",
      error_message: err instanceof Error ? err.message : String(err),
      finished_at: new Date().toISOString(),
    });
    process.exit(1);
  }
}

main();
