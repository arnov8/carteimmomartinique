/**
 * Script d'ingestion DVF (Demandes de Valeurs Foncières)
 *
 * Télécharge les fichiers DVF depuis data.gouv.fr, filtre pour la Martinique (972),
 * nettoie les données, géocode les adresses manquantes, et insère dans Supabase.
 *
 * Usage: npx tsx scripts/ingest-dvf.ts [--year 2023] [--all]
 */

import { parse } from "csv-parse";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import path from "path";
import { supabaseAdmin } from "./lib/supabase-admin.js";
import { geocodeBatch } from "./lib/geocoder.js";
import { log, logError, logProgress } from "./lib/logger.js";

const SOURCE = "DVF";
const DATA_DIR = path.resolve(process.cwd(), "scripts/data");
const BATCH_INSERT_SIZE = 500;
const GEOCODE_BATCH_SIZE = 200;

// DVF est publié par année sur data.gouv.fr
// URL directe des fichiers CSV par département
const DVF_BASE_URL = "https://files.data.gouv.fr/geo-dvf/latest/csv";

interface DvfRawRow {
  date_mutation: string;
  nature_mutation: string;
  valeur_fonciere: string;
  adresse_numero: string;
  adresse_suffixe: string;
  adresse_nom_voie: string;
  code_postal: string;
  nom_commune: string;
  code_commune: string;
  code_departement: string;
  type_local: string;
  surface_reelle_bati: string;
  nombre_pieces_principales: string;
  surface_terrain: string;
  longitude: string;
  latitude: string;
}

interface DvfClean {
  date_mutation: string;
  nature_mutation: string;
  valeur_fonciere: number;
  adresse: string;
  code_postal: string;
  commune: string;
  code_commune: string;
  type_local: string;
  surface_reelle_bati: number | null;
  nombre_pieces: number | null;
  surface_terrain: number | null;
  longitude: number | null;
  latitude: number | null;
}

function getYears(): number[] {
  const args = process.argv.slice(2);
  const yearIdx = args.indexOf("--year");

  if (yearIdx >= 0 && args[yearIdx + 1]) {
    return [parseInt(args[yearIdx + 1])];
  }

  if (args.includes("--all")) {
    // DVF disponible depuis 2018
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = 2018; y <= currentYear - 1; y++) {
      years.push(y);
    }
    return years;
  }

  // Par défaut, les 2 dernières années
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1];
}

async function downloadDvfFile(year: number): Promise<string> {
  const filename = `${year}.csv`;
  const filepath = path.join(DATA_DIR, `dvf-972-${filename}`);

  if (existsSync(filepath)) {
    log(SOURCE, `Fichier ${filename} déjà téléchargé, skip`);
    return filepath;
  }

  mkdirSync(DATA_DIR, { recursive: true });

  // DVF geo par département: on télécharge directement le dept 972
  const url = `${DVF_BASE_URL}/${year}/departements/972.csv`;
  log(SOURCE, `Téléchargement: ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    // Fallback: essayer le fichier France entière
    const urlFull = `${DVF_BASE_URL}/${year}/full.csv.gz`;
    throw new Error(
      `DVF 972 non trouvé pour ${year} (HTTP ${res.status}). Essayez: ${urlFull}`
    );
  }

  const body = res.body;
  if (!body) throw new Error("Response body is null");

  const writer = createWriteStream(filepath);
  await pipeline(Readable.fromWeb(body as import("stream/web").ReadableStream), writer);

  log(SOURCE, `✅ Téléchargé: ${filepath}`);
  return filepath;
}

async function parseDvfFile(filepath: string): Promise<DvfClean[]> {
  const records: DvfClean[] = [];
  let skipped = 0;

  return new Promise((resolve, reject) => {
    const parser = parse({
      delimiter: ",",
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      cast: false,
    });

    const stream = createReadStream(filepath).pipe(parser);

    stream.on("data", (row: DvfRawRow) => {
      // Filtrer : on garde uniquement les mutations avec un prix et une commune
      const valeur = parseFloat(row.valeur_fonciere?.replace(",", "."));
      if (!valeur || valeur <= 0 || !row.nom_commune) {
        skipped++;
        return;
      }

      // Construire l'adresse
      const adresseParts = [
        row.adresse_numero,
        row.adresse_suffixe,
        row.adresse_nom_voie,
      ].filter(Boolean);
      const adresse = adresseParts.join(" ").trim();

      if (!adresse && !row.longitude) {
        skipped++;
        return;
      }

      const surfaceBati = parseFloat(row.surface_reelle_bati);
      const surfaceTerrain = parseFloat(row.surface_terrain);
      const nbPieces = parseInt(row.nombre_pieces_principales);
      const lng = parseFloat(row.longitude);
      const lat = parseFloat(row.latitude);

      records.push({
        date_mutation: row.date_mutation,
        nature_mutation: row.nature_mutation,
        valeur_fonciere: valeur,
        adresse,
        code_postal: row.code_postal || "",
        commune: row.nom_commune,
        code_commune: row.code_commune,
        type_local: row.type_local || "Non renseigné",
        surface_reelle_bati: isNaN(surfaceBati) ? null : surfaceBati,
        nombre_pieces: isNaN(nbPieces) ? null : nbPieces,
        surface_terrain: isNaN(surfaceTerrain) ? null : surfaceTerrain,
        longitude: isNaN(lng) ? null : lng,
        latitude: isNaN(lat) ? null : lat,
      });
    });

    stream.on("end", () => {
      log(
        SOURCE,
        `Parsé: ${records.length} transactions valides, ${skipped} ignorées`
      );
      resolve(records);
    });

    stream.on("error", reject);
  });
}

async function geocodeMissing(records: DvfClean[]): Promise<DvfClean[]> {
  const missing = records.filter((r) => !r.longitude && r.adresse);
  if (missing.length === 0) {
    log(SOURCE, "Toutes les transactions ont des coordonnées GPS");
    return records;
  }

  log(
    SOURCE,
    `${missing.length} transactions sans coordonnées → géocodage via BAN`
  );

  // Géocoder par lots
  for (let i = 0; i < missing.length; i += GEOCODE_BATCH_SIZE) {
    const batch = missing.slice(i, i + GEOCODE_BATCH_SIZE);
    const toGeocode = batch.map((r, idx) => ({
      id: String(i + idx),
      address: `${r.adresse}, ${r.commune}`,
      postcode: r.code_postal,
    }));

    const results = await geocodeBatch(toGeocode);

    for (const [id, coords] of results) {
      const idx = parseInt(id);
      const record = missing[idx];
      if (record && coords.score > 0.4) {
        record.longitude = coords.longitude;
        record.latitude = coords.latitude;
      }
    }

    logProgress(SOURCE, Math.min(i + GEOCODE_BATCH_SIZE, missing.length), missing.length);
    // Rate limit entre les batches
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const geocoded = missing.filter((r) => r.longitude !== null).length;
  log(SOURCE, `✅ Géocodé: ${geocoded}/${missing.length} adresses`);

  return records;
}

async function insertIntoSupabase(records: DvfClean[]): Promise<void> {
  // Filtrer les records sans coordonnées
  const withCoords = records.filter((r) => r.longitude && r.latitude);
  log(
    SOURCE,
    `Insertion: ${withCoords.length} transactions avec coordonnées GPS`
  );

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < withCoords.length; i += BATCH_INSERT_SIZE) {
    const batch = withCoords.slice(i, i + BATCH_INSERT_SIZE);

    const rows = batch.map((r) => ({
      date_mutation: r.date_mutation,
      nature_mutation: r.nature_mutation,
      valeur_fonciere: r.valeur_fonciere,
      adresse: r.adresse,
      code_postal: r.code_postal,
      commune: r.commune,
      code_commune: r.code_commune,
      type_local: r.type_local,
      surface_reelle_bati: r.surface_reelle_bati,
      nombre_pieces: r.nombre_pieces,
      surface_terrain: r.surface_terrain,
      longitude: r.longitude,
      latitude: r.latitude,
      // prix_m2 calculé par le trigger Supabase
    }));

    const { error } = await supabaseAdmin
      .from("transactions_dvf")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: true });

    if (error) {
      // Essayer l'insert simple si upsert échoue
      const { error: insertError } = await supabaseAdmin
        .from("transactions_dvf")
        .insert(rows);

      if (insertError) {
        logError(SOURCE, `Erreur batch ${i}: ${insertError.message}`);
        errors += batch.length;
      } else {
        inserted += batch.length;
      }
    } else {
      inserted += batch.length;
    }

    logProgress(SOURCE, Math.min(i + BATCH_INSERT_SIZE, withCoords.length), withCoords.length);
  }

  log(SOURCE, `✅ Inséré: ${inserted} transactions, ${errors} erreurs`);
}

async function refreshMaterializedViews(): Promise<void> {
  log(SOURCE, "Rafraîchissement des vues matérialisées...");

  const { error } = await supabaseAdmin.rpc("refresh_dvf_stats");
  if (error) {
    // La fonction RPC n'existe peut-être pas encore, on essaie en SQL direct
    logError(
      SOURCE,
      "RPC refresh_dvf_stats non disponible. Exécutez manuellement : REFRESH MATERIALIZED VIEW dvf_stats_commune;"
    );
    return;
  }

  log(SOURCE, "✅ Vues matérialisées rafraîchies");
}

async function logSync(
  status: "running" | "success" | "error",
  stats?: { added: number; errors: number },
  errorMessage?: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("sync_logs")
    .insert({
      source: "DVF",
      status,
      nb_added: stats?.added || 0,
      nb_errors: stats?.errors || 0,
      error_message: errorMessage,
      finished_at: status !== "running" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    logError(SOURCE, "Impossible de logger la sync", error);
    return null;
  }
  return data?.id || null;
}

// --- Main ---
async function main() {
  console.log("\n🏠 CarteImmoMartinique - Ingestion DVF\n");

  const years = getYears();
  log(SOURCE, `Années à traiter: ${years.join(", ")}`);

  const syncId = await logSync("running");

  let totalInserted = 0;
  let totalErrors = 0;

  try {
    for (const year of years) {
      log(SOURCE, `\n--- Année ${year} ---`);

      // 1. Télécharger le fichier
      const filepath = await downloadDvfFile(year);

      // 2. Parser et nettoyer
      const records = await parseDvfFile(filepath);

      if (records.length === 0) {
        log(SOURCE, `Aucune transaction pour ${year}, skip`);
        continue;
      }

      // 3. Géocoder les adresses sans coordonnées
      const geocoded = await geocodeMissing(records);

      // 4. Insérer dans Supabase
      await insertIntoSupabase(geocoded);

      totalInserted += geocoded.filter((r) => r.longitude).length;
    }

    // 5. Rafraîchir les vues matérialisées
    await refreshMaterializedViews();

    await logSync("success", {
      added: totalInserted,
      errors: totalErrors,
    });

    console.log(`\n✅ Ingestion DVF terminée: ${totalInserted} transactions\n`);
  } catch (err) {
    logError(SOURCE, "Erreur fatale", err);
    await logSync(
      "error",
      { added: totalInserted, errors: totalErrors },
      err instanceof Error ? err.message : String(err)
    );
    process.exit(1);
  }
}

main();
