import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/analyse-secteur
 *
 * Analyse complète d'un secteur autour d'un point.
 * Agrège DVF, risques, INSEE, permis, LOVAC, RPLS.
 * Params: lng, lat, rayon (mètres, défaut 500)
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lng = parseFloat(params.get("lng") || "0");
  const lat = parseFloat(params.get("lat") || "0");

  if (!lng || !lat) {
    return NextResponse.json({ error: "lng et lat requis" }, { status: 400 });
  }

  const supabase = getSupabaseServer();

  // Trouver la commune la plus proche via les transactions DVF
  const { data: nearbyDvf } = await supabase
    .from("transactions_dvf")
    .select("commune, code_commune, valeur_fonciere, prix_m2, date_mutation, type_local, surface_reelle_bati")
    .not("longitude", "is", null)
    .gte("longitude", lng - 0.01)
    .lte("longitude", lng + 0.01)
    .gte("latitude", lat - 0.01)
    .lte("latitude", lat + 0.01)
    .order("date_mutation", { ascending: false })
    .limit(50);

  const commune = nearbyDvf?.[0]?.commune || "";
  const codeCommune = nearbyDvf?.[0]?.code_commune || "";

  // DVF stats
  const prixM2List = (nearbyDvf || [])
    .map((d) => d.prix_m2)
    .filter((p): p is number => p !== null && p > 0)
    .sort((a, b) => a - b);

  const dvfStats = {
    nb_transactions: nearbyDvf?.length || 0,
    prix_median_m2: prixM2List.length > 0
      ? prixM2List[Math.floor(prixM2List.length / 2)]
      : null,
    prix_moyen_m2: prixM2List.length > 0
      ? Math.round(prixM2List.reduce((s, p) => s + p, 0) / prixM2List.length)
      : null,
    dernieres_transactions: (nearbyDvf || []).slice(0, 5).map((d) => ({
      date: d.date_mutation,
      prix: d.valeur_fonciere,
      prix_m2: d.prix_m2,
      type: d.type_local,
      surface: d.surface_reelle_bati,
    })),
  };

  // Risques
  const { data: risques } = await supabase
    .from("risques_naturels")
    .select("type_risque, niveau, description")
    .ilike("commune", `%${commune}%`);

  // INSEE
  const { data: insee } = await supabase
    .from("donnees_insee")
    .select("*")
    .eq("code_commune", codeCommune)
    .limit(1);

  // Permis à proximité
  const { data: permis } = await supabase
    .from("permis_construire")
    .select("numero_permis, decision, type_construction, nombre_logements, date_depot")
    .not("longitude", "is", null)
    .gte("longitude", lng - 0.005)
    .lte("longitude", lng + 0.005)
    .gte("latitude", lat - 0.005)
    .lte("latitude", lat + 0.005)
    .eq("decision", "accorde")
    .order("date_depot", { ascending: false })
    .limit(20);

  const permisStats = {
    nb_permis: permis?.length || 0,
    nb_logements_total: (permis || []).reduce((s, p) => s + (p.nombre_logements || 0), 0),
    projets: (permis || []).filter((p) => (p.nombre_logements || 0) > 5),
  };

  // LOVAC
  const { data: lovac } = await supabase
    .from("logements_vacants")
    .select("*")
    .eq("code_commune", codeCommune)
    .limit(1);

  // Parc social
  const { data: social } = await supabase
    .from("parc_social")
    .select("bailleur, nb_logements")
    .eq("code_commune", codeCommune);

  const socialTotal = (social || []).reduce((s, r) => s + (r.nb_logements || 0), 0);

  return NextResponse.json({
    commune,
    code_commune: codeCommune,
    dvf: dvfStats,
    risques: risques || [],
    insee: insee?.[0] || null,
    permis: permisStats,
    lovac: lovac?.[0] || null,
    parc_social: { total_logements: socialTotal, bailleurs: social || [] },
  }, {
    headers: { "Cache-Control": "public, s-maxage=1800" },
  });
}
