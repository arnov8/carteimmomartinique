import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/parcelles
 *
 * Récupère les parcelles cadastrales dans un bounding box.
 * Note: les parcelles avec géométrie lourde sont servies via PMTiles en prod.
 * Cette API sert les métadonnées pour le clic.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const section = params.get("section") || null;
  const numero = params.get("numero") || null;
  const codeCommune = params.get("code_commune") || null;

  const supabase = getSupabaseServer();

  let query = supabase
    .from("parcelles_cadastrales")
    .select("id, commune, prefixe, section, numero, contenance, code_commune")
    .limit(100);

  if (codeCommune) query = query.eq("code_commune", codeCommune);
  if (section) query = query.eq("section", section);
  if (numero) query = query.eq("numero", numero);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { data: data || [] },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400",
      },
    }
  );
}
