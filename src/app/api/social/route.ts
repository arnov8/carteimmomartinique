import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const codeCommune = params.get("code_commune") || null;

  const supabase = getSupabaseServer();

  let query = supabase
    .from("parc_social")
    .select("*")
    .order("nb_logements", { ascending: false });

  if (codeCommune) query = query.eq("code_commune", codeCommune);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Agrégats par commune
  const byCommune = new Map<string, { commune: string; total: number; bailleurs: Array<{ nom: string; nb: number }> }>();
  for (const r of data || []) {
    if (!byCommune.has(r.code_commune)) {
      byCommune.set(r.code_commune, { commune: r.commune, total: 0, bailleurs: [] });
    }
    const c = byCommune.get(r.code_commune)!;
    c.total += r.nb_logements || 0;
    c.bailleurs.push({ nom: r.bailleur, nb: r.nb_logements || 0 });
  }

  return NextResponse.json({
    data: data || [],
    par_commune: Array.from(byCommune.entries()).map(([code, val]) => ({
      code_commune: code,
      ...val,
    })),
  }, {
    headers: { "Cache-Control": "public, s-maxage=86400" },
  });
}
