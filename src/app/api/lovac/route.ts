import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const codeCommune = params.get("code_commune") || null;

  const supabase = getSupabaseServer();

  let query = supabase
    .from("logements_vacants")
    .select("*")
    .order("taux_vacance", { ascending: false });

  if (codeCommune) query = query.eq("code_commune", codeCommune);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: data || [] }, {
    headers: { "Cache-Control": "public, s-maxage=86400" },
  });
}
