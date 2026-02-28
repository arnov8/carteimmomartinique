/**
 * Script d'ingestion Cadastre
 *
 * Télécharge les parcelles cadastrales de la Martinique depuis cadastre.data.gouv.fr
 * et les insère dans Supabase (table parcelles_cadastrales).
 *
 * Usage: npx tsx scripts/ingest-cadastre.ts
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { createGunzip } from "zlib";
import path from "path";
import { supabaseAdmin } from "./lib/supabase-admin.js";
import { log, logError, logProgress } from "./lib/logger.js";

const SOURCE = "CADASTRE";
const DATA_DIR = path.resolve(process.cwd(), "scripts/data");
const BATCH_INSERT_SIZE = 200;

// Cadastre Etalab - parcelles par département en GeoJSON
const CADASTRE_URL =
  "https://cadastre.data.gouv.fr/bundler/cadastre-etalab/departements/972/geojson/parcelles";

interface CadastreFeature {
  type: "Feature";
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    id: string;
    commune: string;
    prefixe: string;
    section: string;
    numero: string;
    contenance: number;
    created: string;
    updated: string;
  };
}

interface CadastreGeoJSON {
  type: "FeatureCollection";
  features: CadastreFeature[];
}

async function downloadCadastre(): Promise<string> {
  const filepath = path.join(DATA_DIR, "cadastre-972-parcelles.json");

  if (existsSync(filepath)) {
    log(SOURCE, "Fichier cadastre déjà téléchargé, skip");
    return filepath;
  }

  mkdirSync(DATA_DIR, { recursive: true });

  log(SOURCE, `Téléchargement du cadastre 972...`);
  log(SOURCE, `URL: ${CADASTRE_URL}`);

  const res = await fetch(CADASTRE_URL);
  if (!res.ok) {
    throw new Error(`Erreur téléchargement cadastre: HTTP ${res.status}`);
  }

  const body = res.body;
  if (!body) throw new Error("Response body is null");

  // Le fichier peut être gzippé ou non
  const contentType = res.headers.get("content-type") || "";
  const contentEncoding = res.headers.get("content-encoding") || "";

  const writer = createWriteStream(filepath);

  if (
    contentEncoding.includes("gzip") ||
    contentType.includes("gzip")
  ) {
    await pipeline(
      Readable.fromWeb(body as import("stream/web").ReadableStream),
      createGunzip(),
      writer
    );
  } else {
    await pipeline(
      Readable.fromWeb(body as import("stream/web").ReadableStream),
      writer
    );
  }

  log(SOURCE, `✅ Cadastre téléchargé: ${filepath}`);
  return filepath;
}

function parseGeoJSON(filepath: string): CadastreFeature[] {
  log(SOURCE, "Parsing GeoJSON...");

  const raw = readFileSync(filepath, "utf-8");
  const geojson: CadastreGeoJSON = JSON.parse(raw);

  log(SOURCE, `${geojson.features.length} parcelles trouvées`);
  return geojson.features;
}

function featureToWKT(feature: CadastreFeature): string | null {
  const { geometry } = feature;

  if (geometry.type === "Polygon") {
    const rings = (geometry.coordinates as number[][][])
      .map(
        (ring) =>
          "(" + ring.map((coord) => `${coord[0]} ${coord[1]}`).join(",") + ")"
      )
      .join(",");
    return `SRID=4326;POLYGON(${rings})`;
  }

  if (geometry.type === "MultiPolygon") {
    const polygons = (geometry.coordinates as number[][][][])
      .map((polygon) => {
        const rings = polygon
          .map(
            (ring) =>
              "(" +
              ring.map((coord) => `${coord[0]} ${coord[1]}`).join(",") +
              ")"
          )
          .join(",");
        return `(${rings})`;
      })
      .join(",");
    return `SRID=4326;MULTIPOLYGON(${polygons})`;
  }

  return null;
}

async function insertParcelles(features: CadastreFeature[]): Promise<void> {
  log(SOURCE, `Insertion de ${features.length} parcelles dans Supabase...`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < features.length; i += BATCH_INSERT_SIZE) {
    const batch = features.slice(i, i + BATCH_INSERT_SIZE);

    const rows = batch
      .map((f) => {
        const wkt = featureToWKT(f);
        if (!wkt) return null;

        // Extraire le code commune depuis l'ID (format: 97209000AB0001)
        const codeCommune = f.properties.commune;

        return {
          commune: codeCommune,
          prefixe: f.properties.prefixe || "",
          section: f.properties.section,
          numero: f.properties.numero,
          contenance: f.properties.contenance || 0,
          code_commune: codeCommune,
          geom: wkt,
        };
      })
      .filter(Boolean);

    if (rows.length === 0) continue;

    const { error } = await supabaseAdmin
      .from("parcelles_cadastrales")
      .insert(rows);

    if (error) {
      logError(SOURCE, `Erreur batch ${i}: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += rows.length;
    }

    logProgress(
      SOURCE,
      Math.min(i + BATCH_INSERT_SIZE, features.length),
      features.length
    );
  }

  log(SOURCE, `✅ Inséré: ${inserted} parcelles, ${errors} erreurs`);
}

async function logSync(
  status: "running" | "success" | "error",
  stats?: { added: number; errors: number },
  errorMessage?: string
): Promise<void> {
  await supabaseAdmin.from("sync_logs").insert({
    source: "CADASTRE",
    status,
    nb_added: stats?.added || 0,
    nb_errors: stats?.errors || 0,
    error_message: errorMessage,
    finished_at: status !== "running" ? new Date().toISOString() : null,
  });
}

// --- Main ---
async function main() {
  console.log("\n📐 CarteImmoMartinique - Ingestion Cadastre\n");

  await logSync("running");

  try {
    // 1. Télécharger le cadastre
    const filepath = await downloadCadastre();

    // 2. Parser le GeoJSON
    const features = parseGeoJSON(filepath);

    if (features.length === 0) {
      log(SOURCE, "Aucune parcelle trouvée, arrêt");
      await logSync("success", { added: 0, errors: 0 });
      return;
    }

    // 3. Insérer dans Supabase
    await insertParcelles(features);

    await logSync("success", { added: features.length, errors: 0 });

    console.log(
      `\n✅ Ingestion Cadastre terminée: ${features.length} parcelles\n`
    );
  } catch (err) {
    logError(SOURCE, "Erreur fatale", err);
    await logSync(
      "error",
      { added: 0, errors: 1 },
      err instanceof Error ? err.message : String(err)
    );
    process.exit(1);
  }
}

main();
