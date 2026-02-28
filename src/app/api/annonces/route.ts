import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const north = parseFloat(params.get("north") || "0");
  const south = parseFloat(params.get("south") || "0");
  const east = parseFloat(params.get("east") || "0");
  const west = parseFloat(params.get("west") || "0");
  const type = params.get("type") || null;

  if (!north || !south || !east || !west) {
    return NextResponse.json({ error: "Bounding box required" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  let query = supabase
    .from("annonces_achatimmo")
    .select("*")
    .eq("actif", true)
    .gte("latitude", south)
    .lte("latitude", north)
    .gte("longitude", west)
    .lte("longitude", east)
    .order("date_publication", { ascending: false })
    .limit(200);

  if (type) query = query.eq("type_bien", type);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const geojson = {
    type: "FeatureCollection",
    features: (data || []).map((a) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [a.longitude, a.latitude],
      },
      properties: {
        id: a.id,
        titre: a.titre,
        prix: a.prix,
        type_bien: a.type_bien,
        surface: a.surface,
        nb_pieces: a.nb_pieces,
        commune: a.commune,
        prix_m2: a.prix_m2,
        photo_url: a.photo_url,
        lien_annonce: a.lien_annonce,
        date_publication: a.date_publication,
      },
    })),
  };

  return NextResponse.json(geojson, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
