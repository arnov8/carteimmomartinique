"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Euro,
  AlertTriangle,
  Users,
  Building,
  Home,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Logo from "@/components/ui/Logo";

interface RadiographieData {
  adresse: string;
  commune: string;
  lng: number;
  lat: number;
  dvf: {
    transactions: Array<{
      date: string;
      prix: number;
      prix_m2: number | null;
      type: string;
      surface: number | null;
      adresse: string;
    }>;
    prix_median_m2: number | null;
    prix_moyen_m2: number | null;
  };
  risques: Array<{
    type_risque: string;
    niveau: string;
    description: string;
  }>;
  insee: {
    population: number;
    menages: number;
    revenu_median: number;
    taux_chomage: number | null;
    evolution_population_5ans: number | null;
  } | null;
  permis: Array<{
    numero: string;
    type: string;
    logements: number;
    date: string;
  }>;
  lovac: {
    taux_vacance: number;
    nb_logements_vacants: number;
  } | null;
  social: {
    total: number;
    bailleurs: Array<{ nom: string; nb: number }>;
  };
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPriceM2(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} €/m²`;
}

const NIVEAU_COLORS: Record<string, string> = {
  faible: "bg-green-100 text-green-700",
  moyen: "bg-yellow-100 text-yellow-700",
  fort: "bg-orange-100 text-orange-700",
  tres_fort: "bg-red-100 text-red-700",
};

export default function RadiographieClient({
  data,
}: {
  data: RadiographieData;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour à la carte</span>
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <Logo size="sm" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
            <MapPin className="h-4 w-4" />
            <span>Radiographie d&apos;adresse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {data.adresse}
          </h1>
          <p className="text-lg text-gray-500 mt-1">{data.commune}, Martinique</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prix immobiliers */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Euro className="h-4 w-4" /> Marché immobilier
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {data.dvf.prix_median_m2
                    ? formatPriceM2(data.dvf.prix_median_m2)
                    : "—"}
                </p>
                <p className="text-xs text-blue-600 mt-1">Prix médian /m²</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {data.dvf.transactions.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Transactions à proximité
                </p>
              </div>
            </div>

            {data.dvf.transactions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-400 uppercase">
                  Dernières ventes
                </h3>
                {data.dvf.transactions.slice(0, 5).map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-gray-50 pb-2"
                  >
                    <div>
                      <p className="text-sm text-gray-700">
                        {t.type || "Bien"}
                        {t.surface ? ` · ${t.surface} m²` : ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(t.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(t.prix)}
                      </p>
                      {t.prix_m2 && (
                        <p className="text-xs text-gray-400">
                          {formatPriceM2(t.prix_m2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Risques */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Risques naturels
            </h2>

            {data.risques.length > 0 ? (
              <div className="space-y-3">
                {data.risques.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        NIVEAU_COLORS[r.niveau] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.niveau === "tres_fort"
                        ? "Très fort"
                        : r.niveau.charAt(0).toUpperCase() + r.niveau.slice(1)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {r.type_risque.replace("_", " ")}
                      </p>
                      <p className="text-xs text-gray-500">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Aucun risque naturel identifié
              </p>
            )}
          </section>

          {/* Démographie */}
          {data.insee && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" /> Données socio-économiques
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Stat
                  label="Population"
                  value={data.insee.population.toLocaleString("fr-FR")}
                />
                <Stat
                  label="Ménages"
                  value={data.insee.menages.toLocaleString("fr-FR")}
                />
                <Stat
                  label="Revenu médian"
                  value={`${data.insee.revenu_median.toLocaleString("fr-FR")} €`}
                />
                {data.insee.taux_chomage !== null && (
                  <Stat
                    label="Taux de chômage"
                    value={`${data.insee.taux_chomage}%`}
                  />
                )}
              </div>

              {data.insee.evolution_population_5ans !== null && (
                <div className="mt-4 flex items-center gap-2">
                  {data.insee.evolution_population_5ans >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      data.insee.evolution_population_5ans >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {data.insee.evolution_population_5ans >= 0 ? "+" : ""}
                    {data.insee.evolution_population_5ans}% sur 5 ans
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Projets & Vacance */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building className="h-4 w-4" /> Projets & Logement
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Stat
                label="Permis accordés"
                value={String(data.permis.length)}
              />
              <Stat
                label="Logements sociaux"
                value={data.social.total.toLocaleString("fr-FR")}
              />
              {data.lovac && (
                <>
                  <Stat
                    label="Taux vacance"
                    value={`${data.lovac.taux_vacance}%`}
                  />
                  <Stat
                    label="Log. vacants"
                    value={data.lovac.nb_logements_vacants.toLocaleString(
                      "fr-FR"
                    )}
                  />
                </>
              )}
            </div>

            {data.permis.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
                  Permis récents
                </h3>
                {data.permis.slice(0, 3).map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm border-b border-gray-50 pb-1.5 mb-1.5"
                  >
                    <span className="text-gray-600 capitalize">
                      {p.type} · {p.logements} log.
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(p.date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href={`/?lng=${data.lng}&lat=${data.lat}&zoom=15`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Voir sur la carte interactive
          </Link>
        </div>

        {/* Sources */}
        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
          Sources : DVF (data.gouv.fr), Géorisques, INSEE, Sitadel, LOVAC, RPLS
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
