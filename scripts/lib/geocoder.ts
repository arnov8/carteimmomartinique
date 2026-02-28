import { log, logError } from "./logger.js";

const BAN_API = "https://api-adresse.data.gouv.fr";
const BATCH_DELAY_MS = 100; // Rate limiting

interface GeocodingResult {
  longitude: number;
  latitude: number;
  score: number;
}

/**
 * Géocode une adresse unique via l'API BAN
 */
export async function geocodeAddress(
  address: string,
  postcode?: string
): Promise<GeocodingResult | null> {
  try {
    const params = new URLSearchParams({
      q: address,
      limit: "1",
      lat: "14.6415",
      lon: "-61.0242",
    });
    if (postcode) params.set("postcode", postcode);

    const res = await fetch(`${BAN_API}/search/?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    return {
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
      score: feature.properties.score,
    };
  } catch {
    return null;
  }
}

/**
 * Géocode un lot d'adresses via l'API BAN en mode CSV batch
 * Plus efficace pour de gros volumes
 */
export async function geocodeBatch(
  rows: Array<{ id: string; address: string; postcode?: string }>
): Promise<Map<string, GeocodingResult>> {
  const results = new Map<string, GeocodingResult>();

  // L'API BAN accepte du CSV en POST pour le géocodage de masse
  const csvHeader = "id,adresse,postcode\n";
  const csvRows = rows
    .map(
      (r) =>
        `${r.id},"${r.address.replace(/"/g, '""')}",${r.postcode || ""}`
    )
    .join("\n");
  const csvBody = csvHeader + csvRows;

  try {
    const res = await fetch(`${BAN_API}/search/csv/`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csvBody,
    });

    if (!res.ok) {
      logError("geocoder", `Batch geocoding failed: ${res.status}`);
      return results;
    }

    const text = await res.text();
    const lines = text.split("\n").slice(1); // Skip header

    for (const line of lines) {
      if (!line.trim()) continue;
      // Le CSV retourné par la BAN a les colonnes: id, adresse, postcode, result_*
      const parts = line.split(",");
      const id = parts[0];
      // Les colonnes latitude et longitude sont à la fin
      const latIdx = text
        .split("\n")[0]
        .split(",")
        .indexOf("latitude");
      const lonIdx = text
        .split("\n")[0]
        .split(",")
        .indexOf("longitude");
      const scoreIdx = text
        .split("\n")[0]
        .split(",")
        .indexOf("result_score");

      if (latIdx >= 0 && lonIdx >= 0) {
        const lat = parseFloat(parts[latIdx]);
        const lon = parseFloat(parts[lonIdx]);
        const score = scoreIdx >= 0 ? parseFloat(parts[scoreIdx]) : 0;
        if (!isNaN(lat) && !isNaN(lon)) {
          results.set(id, { longitude: lon, latitude: lat, score });
        }
      }
    }

    log("geocoder", `Batch: ${results.size}/${rows.length} adresses géocodées`);
  } catch (err) {
    logError("geocoder", "Erreur batch geocoding", err);
  }

  return results;
}

/**
 * Géocode séquentiellement avec rate limiting
 */
export async function geocodeSequential(
  addresses: Array<{ id: string; address: string; postcode?: string }>
): Promise<Map<string, GeocodingResult>> {
  const results = new Map<string, GeocodingResult>();

  for (const item of addresses) {
    const result = await geocodeAddress(item.address, item.postcode);
    if (result && result.score > 0.4) {
      results.set(item.id, result);
    }
    await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
  }

  return results;
}
