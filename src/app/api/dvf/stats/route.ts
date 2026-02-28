import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/dvf/stats
 *
 * Récupère les statistiques DVF agrégées par commune.
 * Params: code_commune (optionnel)
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const codeCommune = params.get("code_commune") || null;

  const supabase = getSupabaseServer();

  // Statistiques par commune
  let query = supabase
    .from("transactions_dvf")
    .select("code_commune, commune, type_local, valeur_fonciere, prix_m2, date_mutation, surface_reelle_bati")
    .not("prix_m2", "is", null)
    .gt("prix_m2", 0);

  if (codeCommune) {
    query = query.eq("code_commune", codeCommune);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ stats: [] });
  }

  // Agréger en mémoire par commune
  const communeMap = new Map<
    string,
    {
      code_commune: string;
      commune: string;
      transactions: Array<{
        prix_m2: number;
        valeur_fonciere: number;
        type_local: string;
        date_mutation: string;
      }>;
    }
  >();

  for (const row of data) {
    const key = row.code_commune;
    if (!communeMap.has(key)) {
      communeMap.set(key, {
        code_commune: row.code_commune,
        commune: row.commune,
        transactions: [],
      });
    }
    communeMap.get(key)!.transactions.push({
      prix_m2: row.prix_m2,
      valeur_fonciere: row.valeur_fonciere,
      type_local: row.type_local,
      date_mutation: row.date_mutation,
    });
  }

  const stats = Array.from(communeMap.values()).map((c) => {
    const prixM2List = c.transactions
      .map((t) => t.prix_m2)
      .sort((a, b) => a - b);
    const median =
      prixM2List.length % 2 === 0
        ? (prixM2List[prixM2List.length / 2 - 1] +
            prixM2List[prixM2List.length / 2]) /
          2
        : prixM2List[Math.floor(prixM2List.length / 2)];

    // Par type de bien
    const byType = new Map<string, number[]>();
    for (const t of c.transactions) {
      if (!byType.has(t.type_local)) byType.set(t.type_local, []);
      byType.get(t.type_local)!.push(t.prix_m2);
    }

    const typesStats = Array.from(byType.entries()).map(([type, prices]) => ({
      type,
      count: prices.length,
      prix_median_m2: prices.sort((a, b) => a - b)[
        Math.floor(prices.length / 2)
      ],
    }));

    // Par année
    const byYear = new Map<string, number[]>();
    for (const t of c.transactions) {
      const year = t.date_mutation.slice(0, 4);
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year)!.push(t.prix_m2);
    }

    const yearStats = Array.from(byYear.entries())
      .map(([year, prices]) => ({
        year,
        count: prices.length,
        prix_median_m2: prices.sort((a, b) => a - b)[
          Math.floor(prices.length / 2)
        ],
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    return {
      code_commune: c.code_commune,
      commune: c.commune,
      nb_transactions: c.transactions.length,
      prix_median_m2: Math.round(median),
      prix_moyen_m2: Math.round(
        c.transactions.reduce((s, t) => s + t.prix_m2, 0) /
          c.transactions.length
      ),
      par_type: typesStats,
      par_annee: yearStats,
    };
  });

  return NextResponse.json(
    { stats },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
