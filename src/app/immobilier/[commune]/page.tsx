import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { COMMUNES_MARTINIQUE } from "@/lib/constants";
import CommunePageClient from "./CommunePageClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ commune: string }>;
}

const COMMUNE_SLUGS = COMMUNES_MARTINIQUE.reduce(
  (acc, c) => {
    const slug = c
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    acc[slug] = c;
    return acc;
  },
  {} as Record<string, string>
);

function findCommune(slug: string): string | null {
  return COMMUNE_SLUGS[slug] || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { commune: slug } = await params;
  const commune = findCommune(slug);
  if (!commune) return { title: "Commune introuvable" };

  return {
    title: `Immobilier ${commune} — Prix, tendances et analyse | CarteImmoMartinique`,
    description: `Tout savoir sur l'immobilier à ${commune} en Martinique : prix au m², transactions récentes, risques naturels, démographie, logements vacants. Données officielles DVF, INSEE, Géorisques.`,
    openGraph: {
      title: `Immobilier à ${commune} (Martinique)`,
      description: `Prix immobiliers, tendances du marché et analyse complète de ${commune}`,
    },
  };
}

export default async function CommunePage({ params }: PageProps) {
  const { commune: slug } = await params;
  const commune = findCommune(slug);
  if (!commune) notFound();

  const supabase = getSupabaseServer();

  // Parallel data fetching
  const [inseeRes, lovacRes, socialRes, risquesRes, dvfRes] =
    await Promise.all([
      supabase
        .from("donnees_insee")
        .select("*")
        .ilike("commune", commune)
        .limit(1),
      supabase
        .from("logements_vacants")
        .select("*")
        .ilike("commune", commune)
        .limit(1),
      supabase
        .from("parc_social")
        .select("bailleur, nb_logements")
        .ilike("commune", commune),
      supabase
        .from("risques_naturels")
        .select("type_risque, niveau, description")
        .ilike("commune", commune),
      supabase
        .from("transactions_dvf")
        .select(
          "date_mutation, valeur_fonciere, prix_m2, type_local, surface_reelle_bati"
        )
        .ilike("commune", commune)
        .order("date_mutation", { ascending: false })
        .limit(50),
    ]);

  const insee = inseeRes.data?.[0] || null;
  const lovac = lovacRes.data?.[0] || null;
  const social = socialRes.data || [];
  const risques = risquesRes.data || [];
  const dvf = dvfRes.data || [];

  const prixM2List = dvf
    .map((d) => d.prix_m2)
    .filter((p): p is number => p !== null && p > 0)
    .sort((a, b) => a - b);

  const pageData = {
    commune,
    slug,
    dvf: {
      nb_transactions: dvf.length,
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
      dernieres: dvf.slice(0, 10).map((d) => ({
        date: d.date_mutation,
        prix: d.valeur_fonciere,
        prix_m2: d.prix_m2,
        type: d.type_local,
        surface: d.surface_reelle_bati,
      })),
    },
    insee: insee
      ? {
          population: insee.population,
          menages: insee.menages,
          revenu_median: insee.revenu_median,
          taux_chomage: insee.taux_chomage,
          evolution_pop: insee.evolution_population_5ans,
        }
      : null,
    risques: risques.map((r) => ({
      type: r.type_risque,
      niveau: r.niveau,
      description: r.description,
    })),
    lovac: lovac
      ? {
          taux_vacance: lovac.taux_vacance,
          nb_vacants: lovac.nb_logements_vacants,
        }
      : null,
    social: {
      total: social.reduce((s, r) => s + (r.nb_logements || 0), 0),
      bailleurs: social
        .map((s) => ({ nom: s.bailleur, nb: s.nb_logements || 0 }))
        .sort((a, b) => b.nb - a.nb),
    },
  };

  return <CommunePageClient data={pageData} />;
}
