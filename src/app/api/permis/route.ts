import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/permis
 *
 * Récupère les permis de construire dans un bounding box.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const west = parseFloat(params.get("west") || "-62");
  const south = parseFloat(params.get("south") || "14.2");
  const east = parseFloat(params.get("east") || "-60.5");
  const north = parseFloat(params.get("north") || "15.1");
  const typeConstruction = params.get("type_construction") || null;
  const decision = params.get("decision") || null;
  const dateFrom = params.get("date_from") || null;
  const dateTo = params.get("date_to") || null;
  const limit = parseInt(params.get("limit") || "500");

  const supabase = getSupabaseServer();

  let query = supabase
    .from("permis_construire")
    .select("*")
    .not("longitude", "is", null)
    .not("latitude", "is", null)
    .gte("longitude", west)
    .lte("longitude", east)
    .gte("latitude", south)
    .lte("latitude", north)
    .order("date_depot", { ascending: false })
    .limit(limit);

  if (typeConstruction) query = query.eq("type_construction", typeConstruction);
  if (decision) query = query.eq("decision", decision);
  if (dateFrom) query = query.gte("date_depot", dateFrom);
  if (dateTo) query = query.lte("date_depot", dateTo);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const geojson = {
    type: "FeatureCollection" as const,
    features: (data || []).map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        id: p.id,
        numero_permis: p.numero_permis,
        date_depot: p.date_depot,
        date_decision: p.date_decision,
        decision: p.decision,
        type_construction: p.type_construction,
        nombre_logements: p.nombre_logements,
        surface_plancher: p.surface_plancher,
        adresse: p.adresse,
        commune: p.commune,
        nature_travaux: p.nature_travaux,
        maitre_ouvrage: p.maitre_ouvrage,
      },
    })),
  };

  return NextResponse.json(geojson, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
