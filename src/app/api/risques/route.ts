import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/risques
 *
 * Récupère les risques naturels par commune ou bounding box.
 * Params: commune, code_commune, type_risque
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const commune = params.get("commune") || null;
  const codeCommune = params.get("code_commune") || null;
  const typeRisque = params.get("type_risque") || null;

  const supabase = getSupabaseServer();

  let query = supabase
    .from("risques_naturels")
    .select("id, commune, type_risque, niveau, description, source")
    .order("commune");

  if (commune) {
    query = query.ilike("commune", `%${commune}%`);
  }
  if (codeCommune) {
    // On n'a pas code_commune dans la table risques, on filtre par commune
    // Pour l'instant, on retourne tout
  }
  if (typeRisque) {
    query = query.eq("type_risque", typeRisque);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Grouper par commune pour un affichage efficace
  const byCommune = new Map<
    string,
    Array<{
      type_risque: string;
      niveau: string;
      description: string;
      source: string;
    }>
  >();

  for (const r of data || []) {
    if (!byCommune.has(r.commune)) byCommune.set(r.commune, []);
    byCommune.get(r.commune)!.push({
      type_risque: r.type_risque,
      niveau: r.niveau,
      description: r.description,
      source: r.source,
    });
  }

  const result = Array.from(byCommune.entries()).map(([commune, risques]) => ({
    commune,
    risques,
    niveau_max: getMaxNiveau(risques.map((r) => r.niveau)),
    nb_risques: risques.length,
  }));

  return NextResponse.json(
    { data: result, total: data?.length || 0 },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}

function getMaxNiveau(niveaux: string[]): string {
  const order: Record<string, number> = {
    faible: 1,
    moyen: 2,
    fort: 3,
    tres_fort: 4,
  };
  let max = 0;
  let maxLabel = "faible";
  for (const n of niveaux) {
    if ((order[n] || 0) > max) {
      max = order[n] || 0;
      maxLabel = n;
    }
  }
  return maxLabel;
}
