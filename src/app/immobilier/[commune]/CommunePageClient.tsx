"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Euro,
  Users,
  AlertTriangle,
  Home,
  Building,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from "lucide-react";
import Logo from "@/components/ui/Logo";

interface CommunePageData {
  commune: string;
  slug: string;
  dvf: {
    nb_transactions: number;
    prix_median_m2: number | null;
    prix_moyen_m2: number | null;
    dernieres: Array<{
      date: string;
      prix: number;
      prix_m2: number | null;
      type: string;
      surface: number | null;
    }>;
  };
  insee: {
    population: number;
    menages: number;
    revenu_median: number;
    taux_chomage: number | null;
    evolution_pop: number | null;
  } | null;
  risques: Array<{
    type: string;
    niveau: string;
    description: string;
  }>;
  lovac: {
    taux_vacance: number;
    nb_vacants: number;
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

const NIVEAU_COLORS: Record<string, string> = {
  faible: "bg-green-100 text-green-700",
  moyen: "bg-yellow-100 text-yellow-700",
  fort: "bg-orange-100 text-orange-700",
  tres_fort: "bg-red-100 text-red-700",
};

export default function CommunePageClient({
  data,
}: {
  data: CommunePageData;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Carte</span>
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <Logo size="sm" />
          <div className="h-5 w-px bg-gray-200" />
          <Link
            href="/comparer"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            Comparer
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-blue-200 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Martinique</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Immobilier à {data.commune}
          </h1>
          <p className="text-blue-100 text-lg">
            Prix, tendances et analyse complète du marché immobilier
          </p>

          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl font-bold">
                {data.dvf.prix_median_m2
                  ? `${Math.round(data.dvf.prix_median_m2).toLocaleString("fr-FR")} €`
                  : "—"}
              </p>
              <p className="text-sm text-blue-200">Prix médian /m²</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl font-bold">
                {data.insee?.population.toLocaleString("fr-FR") || "—"}
              </p>
              <p className="text-sm text-blue-200">Habitants</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl font-bold">
                {data.lovac ? `${data.lovac.taux_vacance}%` : "—"}
              </p>
              <p className="text-sm text-blue-200">Taux vacance</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-2xl font-bold">{data.risques.length}</p>
              <p className="text-sm text-blue-200">Risques identifiés</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* DVF */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Euro className="h-5 w-5 text-blue-600" />
                Transactions immobilières
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Dernières ventes enregistrées (source DVF)
              </p>

              {data.dvf.prix_moyen_m2 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-blue-700">
                      {data.dvf.prix_median_m2?.toLocaleString("fr-FR")} €/m²
                    </p>
                    <p className="text-xs text-blue-600">Prix médian</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {data.dvf.prix_moyen_m2?.toLocaleString("fr-FR")} €/m²
                    </p>
                    <p className="text-xs text-gray-500">Prix moyen</p>
                  </div>
                </div>
              )}

              {data.dvf.dernieres.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-gray-400 font-medium">
                          Date
                        </th>
                        <th className="text-left py-2 pr-4 text-gray-400 font-medium">
                          Type
                        </th>
                        <th className="text-right py-2 pr-4 text-gray-400 font-medium">
                          Surface
                        </th>
                        <th className="text-right py-2 pr-4 text-gray-400 font-medium">
                          Prix
                        </th>
                        <th className="text-right py-2 text-gray-400 font-medium">
                          €/m²
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dvf.dernieres.map((t, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2.5 pr-4 text-gray-600">
                            {new Date(t.date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-700">
                            {t.type || "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-gray-600">
                            {t.surface ? `${t.surface} m²` : "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-right font-medium text-gray-900">
                            {formatPrice(t.prix)}
                          </td>
                          <td className="py-2.5 text-right text-gray-600">
                            {t.prix_m2
                              ? `${Math.round(t.prix_m2).toLocaleString("fr-FR")}`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Aucune transaction récente enregistrée
                </p>
              )}
            </section>

            {/* Risques */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Risques naturels
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Source : Géorisques / GASPAR
              </p>

              {data.risques.length > 0 ? (
                <div className="space-y-3">
                  {data.risques.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 border-b border-gray-50 pb-3"
                    >
                      <span
                        className={`shrink-0 mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          NIVEAU_COLORS[r.niveau] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.niveau === "tres_fort" ? "Très fort" : r.niveau}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-700 capitalize">
                          {r.type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-gray-500">{r.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Aucun risque naturel référencé
                </p>
              )}
            </section>
          </div>

          {/* Right column - 1/3 */}
          <div className="space-y-6">
            {/* Démographie */}
            {data.insee && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Démographie
                </h2>
                <div className="space-y-3">
                  <StatRow
                    label="Population"
                    value={data.insee.population.toLocaleString("fr-FR")}
                  />
                  <StatRow
                    label="Ménages"
                    value={data.insee.menages.toLocaleString("fr-FR")}
                  />
                  <StatRow
                    label="Revenu médian"
                    value={`${data.insee.revenu_median.toLocaleString("fr-FR")} €`}
                  />
                  {data.insee.taux_chomage !== null && (
                    <StatRow
                      label="Chômage"
                      value={`${data.insee.taux_chomage}%`}
                    />
                  )}
                  {data.insee.evolution_pop !== null && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600">
                        Évolution 5 ans
                      </span>
                      <span
                        className={`text-sm font-semibold flex items-center gap-1 ${
                          data.insee.evolution_pop >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {data.insee.evolution_pop >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {data.insee.evolution_pop >= 0 ? "+" : ""}
                        {data.insee.evolution_pop}%
                      </span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Logement */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Home className="h-4 w-4" /> Logement
              </h2>
              <div className="space-y-3">
                {data.lovac && (
                  <>
                    <StatRow
                      label="Taux vacance"
                      value={`${data.lovac.taux_vacance}%`}
                    />
                    <StatRow
                      label="Log. vacants"
                      value={data.lovac.nb_vacants.toLocaleString("fr-FR")}
                    />
                  </>
                )}
                <StatRow
                  label="Log. sociaux"
                  value={data.social.total.toLocaleString("fr-FR")}
                />
              </div>

              {data.social.bailleurs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 uppercase mb-2">
                    Bailleurs
                  </p>
                  {data.social.bailleurs.slice(0, 4).map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm py-0.5"
                    >
                      <span className="text-gray-600 truncate">{b.nom}</span>
                      <span className="text-gray-400 flex-shrink-0 ml-2">
                        {b.nb}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center">
              <MapPin className="h-8 w-8 mx-auto mb-3 opacity-80" />
              <p className="font-semibold mb-1">Explorer sur la carte</p>
              <p className="text-sm text-blue-200 mb-4">
                Visualisez toutes les données en temps réel
              </p>
              <Link
                href="/"
                className="inline-block bg-white text-blue-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                Ouvrir la carte
              </Link>
            </div>
          </div>
        </div>

        {/* SEO text */}
        <section className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            L&apos;immobilier à {data.commune} en résumé
          </h2>
          <div className="prose prose-sm prose-gray max-w-none">
            <p>
              {data.commune} est une commune de la Martinique
              {data.insee
                ? ` comptant ${data.insee.population.toLocaleString("fr-FR")} habitants`
                : ""}
              .
              {data.dvf.prix_median_m2
                ? ` Le prix médian au m² s'établit à ${data.dvf.prix_median_m2.toLocaleString("fr-FR")} €/m², basé sur les ${data.dvf.nb_transactions} transactions enregistrées.`
                : ""}
            </p>
            {data.risques.length > 0 && (
              <p>
                La commune est exposée à {data.risques.length} type
                {data.risques.length > 1 ? "s" : ""} de risques naturels,
                incluant{" "}
                {data.risques
                  .map((r) => r.type.replace("_", " "))
                  .join(", ")}
                . Ces informations sont essentielles à prendre en compte pour
                tout projet d&apos;acquisition immobilière.
              </p>
            )}
            {data.lovac && (
              <p>
                Le taux de vacance des logements est de{" "}
                {data.lovac.taux_vacance}%, ce qui{" "}
                {data.lovac.taux_vacance < 8
                  ? "indique un marché dynamique"
                  : data.lovac.taux_vacance < 15
                  ? "reste dans la moyenne"
                  : "signale un marché en difficulté"}
                . Le parc social compte {data.social.total.toLocaleString("fr-FR")} logements.
              </p>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 mt-8 mb-4">
          Données : DVF (data.gouv.fr), INSEE, Géorisques, LOVAC, RPLS — ©
          CarteImmoMartinique 2026
        </p>
      </main>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
