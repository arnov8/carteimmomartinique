import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import RadiographieClient from "./RadiographieClient";

interface PageProps {
  params: Promise<{ commune: string; adresse: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { commune, adresse } = await params;
  const communeDecoded = decodeURIComponent(commune).replace(/-/g, " ");
  const adresseDecoded = decodeURIComponent(adresse).replace(/-/g, " ");

  return {
    title: `${adresseDecoded}, ${communeDecoded} — Radiographie | CarteImmoMartinique`,
    description: `Analyse complète du secteur autour de ${adresseDecoded} à ${communeDecoded} : prix immobiliers, risques naturels, démographie, projets.`,
  };
}

export default async function RadiographiePage({ params }: PageProps) {
  const { commune, adresse } = await params;
  const communeDecoded = decodeURIComponent(commune).replace(/-/g, " ");
  const adresseDecoded = decodeURIComponent(adresse).replace(/-/g, " ");

  // Geocode the address via BAN API
  const query = `${adresseDecoded} ${communeDecoded} Martinique`;
  let lng = 0;
  let lat = 0;

  try {
    const banRes = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`
    );
    const banData = await banRes.json();
    if (banData.features?.length > 0) {
      const [geoLng, geoLat] = banData.features[0].geometry.coordinates;
      lng = geoLng;
      lat = geoLat;
    }
  } catch {
    // Fallback: use commune center
  }

  if (!lng || !lat) {
    notFound();
  }

  // Fetch sector analysis
  const supabase = getSupabaseServer();

  // DVF nearby
  const { data: dvfNearby } = await supabase
    .from("transactions_dvf")
    .select("*")
    .not("longitude", "is", null)
    .gte("longitude", lng - 0.005)
    .lte("longitude", lng + 0.005)
    .gte("latitude", lat - 0.005)
    .lte("latitude", lat + 0.005)
    .order("date_mutation", { ascending: false })
    .limit(20);

  // Find code_commune from DVF or ilike
  const codeCommune = dvfNearby?.[0]?.code_commune || "";

  // Risques
  const { data: risques } = await supabase
    .from("risques_naturels")
    .select("type_risque, niveau, description")
    .ilike("commune", `%${communeDecoded}%`);

  // INSEE
  const { data: insee } = await supabase
    .from("donnees_insee")
    .select("*")
    .eq("code_commune", codeCommune)
    .limit(1);

  // Permis nearby
  const { data: permis } = await supabase
    .from("permis_construire")
    .select("*")
    .not("longitude", "is", null)
    .gte("longitude", lng - 0.005)
    .lte("longitude", lng + 0.005)
    .gte("latitude", lat - 0.005)
    .lte("latitude", lat + 0.005)
    .eq("decision", "accorde")
    .order("date_depot", { ascending: false })
    .limit(10);

  // LOVAC
  const { data: lovac } = await supabase
    .from("logements_vacants")
    .select("*")
    .eq("code_commune", codeCommune)
    .limit(1);

  // Social
  const { data: social } = await supabase
    .from("parc_social")
    .select("bailleur, nb_logements")
    .eq("code_commune", codeCommune);

  const prixM2List = (dvfNearby || [])
    .map((d) => d.prix_m2)
    .filter((p): p is number => p !== null && p > 0)
    .sort((a, b) => a - b);

  const sectorData = {
    adresse: adresseDecoded,
    commune: communeDecoded,
    lng,
    lat,
    dvf: {
      transactions: (dvfNearby || []).map((d) => ({
        date: d.date_mutation,
        prix: d.valeur_fonciere,
        prix_m2: d.prix_m2,
        type: d.type_local,
        surface: d.surface_reelle_bati,
        adresse: d.adresse,
      })),
      prix_median_m2:
        prixM2List.length > 0
          ? prixM2List[Math.floor(prixM2List.length / 2)]
          : null,
      prix_moyen_m2:
        prixM2List.length > 0
          ? Math.round(
              prixM2List.reduce((s, p) => s + p, 0) / prixM2List.length
            )
          : null,
    },
    risques: risques || [],
    insee: insee?.[0] || null,
    permis: (permis || []).map((p) => ({
      numero: p.numero_permis,
      type: p.type_construction,
      logements: p.nombre_logements,
      date: p.date_depot,
    })),
    lovac: lovac?.[0] || null,
    social: {
      total: (social || []).reduce((s, r) => s + (r.nb_logements || 0), 0),
      bailleurs: (social || []).map((s) => ({
        nom: s.bailleur,
        nb: s.nb_logements,
      })),
    },
  };

  return <RadiographieClient data={sectorData} />;
}
