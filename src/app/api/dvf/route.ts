import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/dvf
 *
 * Récupère les transactions DVF dans un bounding box.
 * Params: west, south, east, north, type, date_from, date_to, prix_min, prix_max, limit
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const west = parseFloat(params.get("west") || "-62");
  const south = parseFloat(params.get("south") || "14.2");
  const east = parseFloat(params.get("east") || "-60.5");
  const north = parseFloat(params.get("north") || "15.1");
  const type = params.get("type") || null;
  const dateFrom = params.get("date_from") || null;
  const dateTo = params.get("date_to") || null;
  const prixMin = params.get("prix_min")
    ? parseFloat(params.get("prix_min")!)
    : null;
  const prixMax = params.get("prix_max")
    ? parseFloat(params.get("prix_max")!)
    : null;
  const limit = parseInt(params.get("limit") || "1000");

  const supabase = getSupabaseServer();

  // Utiliser la fonction RPC PostGIS si disponible, sinon query directe
  let query = supabase
    .from("transactions_dvf")
    .select(
      "id, date_mutation, nature_mutation, valeur_fonciere, adresse, code_postal, commune, code_commune, type_local, surface_reelle_bati, nombre_pieces, surface_terrain, longitude, latitude, prix_m2"
    )
    .not("longitude", "is", null)
    .not("latitude", "is", null)
    .gte("longitude", west)
    .lte("longitude", east)
    .gte("latitude", south)
    .lte("latitude", north)
    .order("date_mutation", { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq("type_local", type);
  }
  if (dateFrom) {
    query = query.gte("date_mutation", dateFrom);
  }
  if (dateTo) {
    query = query.lte("date_mutation", dateTo);
  }
  if (prixMin !== null) {
    query = query.gte("valeur_fonciere", prixMin);
  }
  if (prixMax !== null) {
    query = query.lte("valeur_fonciere", prixMax);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Formater en GeoJSON pour MapLibre
  const geojson = {
    type: "FeatureCollection" as const,
    features: (data || []).map((t) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [t.longitude, t.latitude],
      },
      properties: {
        id: t.id,
        date_mutation: t.date_mutation,
        nature_mutation: t.nature_mutation,
        valeur_fonciere: t.valeur_fonciere,
        adresse: t.adresse,
        code_postal: t.code_postal,
        commune: t.commune,
        type_local: t.type_local,
        surface_reelle_bati: t.surface_reelle_bati,
        nombre_pieces: t.nombre_pieces,
        surface_terrain: t.surface_terrain,
        prix_m2: t.prix_m2,
      },
    })),
  };

  return NextResponse.json(geojson, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
