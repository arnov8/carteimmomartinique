"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  X,
  Plus,
  Euro,
  Users,
  AlertTriangle,
  Home,
  Building,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { COMMUNES_MARTINIQUE } from "@/lib/constants";

interface CommuneData {
  commune: string;
  code_commune: string;
  dvf_prix_median: number | null;
  dvf_nb_transactions: number;
  population: number;
  menages: number;
  revenu_median: number;
  taux_chomage: number | null;
  evolution_pop: number | null;
  nb_risques: number;
  taux_vacance: number | null;
  nb_logements_sociaux: number;
}

function formatPrice(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} €/m²`;
}

export default function ComparerPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<Record<string, CommuneData>>({});
  const [loading, setLoading] = useState(false);

  const filteredCommunes = COMMUNES_MARTINIQUE.filter(
    (c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selected.includes(c)
  );

  const addCommune = useCallback(
    (commune: string) => {
      if (selected.length >= 4) return;
      setSelected((prev) => [...prev, commune]);
      setSearchQuery("");
    },
    [selected]
  );

  const removeCommune = useCallback((commune: string) => {
    setSelected((prev) => prev.filter((c) => c !== commune));
  }, []);

  // Fetch data for selected communes
  useEffect(() => {
    if (selected.length === 0) return;

    const newCommunes = selected.filter((c) => !data[c]);
    if (newCommunes.length === 0) return;

    setLoading(true);

    Promise.all(
      newCommunes.map(async (commune) => {
        try {
          // Fetch in parallel
          const [inseeRes, lovacRes, socialRes, risquesRes, dvfRes] =
            await Promise.all([
              fetch(`/api/insee`),
              fetch(`/api/lovac`),
              fetch(`/api/social`),
              fetch(`/api/risques`),
              fetch(`/api/dvf/stats`),
            ]);

          const inseeJson = await inseeRes.json();
          const lovacJson = await lovacRes.json();
          const socialJson = await socialRes.json();
          const risquesJson = await risquesRes.json();
          const dvfJson = await dvfRes.json();

          const inseeItem = (inseeJson.data || []).find(
            (d: { commune: string }) => d.commune === commune
          );
          const lovacItem = (lovacJson.data || []).find(
            (d: { commune: string }) => d.commune === commune
          );
          const socialItem = (socialJson.par_commune || []).find(
            (d: { commune: string }) => d.commune === commune
          );
          const risquesItem = (risquesJson.data || []).find(
            (d: { commune: string }) => d.commune === commune
          );
          const dvfItem = (dvfJson.data || []).find(
            (d: { commune: string }) => d.commune === commune
          );

          const communeData: CommuneData = {
            commune,
            code_commune: inseeItem?.code_commune || "",
            dvf_prix_median: dvfItem?.prix_median_m2 || null,
            dvf_nb_transactions: dvfItem?.nb_transactions || 0,
            population: inseeItem?.population || 0,
            menages: inseeItem?.menages || 0,
            revenu_median: inseeItem?.revenu_median || 0,
            taux_chomage: inseeItem?.taux_chomage || null,
            evolution_pop: inseeItem?.evolution_population_5ans || null,
            nb_risques: risquesItem?.nb_risques || 0,
            taux_vacance: lovacItem?.taux_vacance || null,
            nb_logements_sociaux: socialItem?.total || 0,
          };

          return { commune, data: communeData };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      const newData: Record<string, CommuneData> = {};
      for (const r of results) {
        if (r) newData[r.commune] = r.data;
      }
      setData((prev) => ({ ...prev, ...newData }));
      setLoading(false);
    });
  }, [selected, data]);

  const selectedData = selected
    .map((c) => data[c])
    .filter((d): d is CommuneData => !!d);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Carte</span>
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <Logo size="sm" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Comparateur de communes
        </h1>
        <p className="text-gray-500 mb-6">
          Comparez jusqu&apos;à 4 communes de Martinique sur tous les indicateurs
        </p>

        {/* Search & Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {selected.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {c}
                <button
                  onClick={() => removeCommune(c)}
                  className="hover:bg-blue-100 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selected.length < 4 && (
              <span className="text-xs text-gray-400">
                {4 - selected.length} emplacement
                {4 - selected.length > 1 ? "s" : ""} restant
                {4 - selected.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {selected.length < 4 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une commune..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-48 overflow-y-auto z-20">
                  {filteredCommunes.slice(0, 8).map((c) => (
                    <button
                      key={c}
                      onClick={() => addCommune(c)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-3.5 w-3.5 text-blue-500" />
                      {c}
                    </button>
                  ))}
                  {filteredCommunes.length === 0 && (
                    <p className="px-4 py-3 text-sm text-gray-400">
                      Aucune commune trouvée
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedData.length >= 2 && !loading && (
          <div className="space-y-6">
            {/* Immobilier */}
            <ComparisonSection
              title="Marché immobilier"
              icon={<Euro className="h-4 w-4" />}
              rows={[
                {
                  label: "Prix médian /m²",
                  values: selectedData.map((d) =>
                    d.dvf_prix_median ? formatPrice(d.dvf_prix_median) : "—"
                  ),
                  highlight: true,
                },
                {
                  label: "Transactions",
                  values: selectedData.map((d) => String(d.dvf_nb_transactions)),
                },
              ]}
              communes={selectedData.map((d) => d.commune)}
            />

            {/* Démographie */}
            <ComparisonSection
              title="Population"
              icon={<Users className="h-4 w-4" />}
              rows={[
                {
                  label: "Population",
                  values: selectedData.map((d) =>
                    d.population.toLocaleString("fr-FR")
                  ),
                },
                {
                  label: "Ménages",
                  values: selectedData.map((d) =>
                    d.menages.toLocaleString("fr-FR")
                  ),
                },
                {
                  label: "Revenu médian",
                  values: selectedData.map(
                    (d) => `${d.revenu_median.toLocaleString("fr-FR")} €`
                  ),
                  highlight: true,
                },
                {
                  label: "Chômage",
                  values: selectedData.map((d) =>
                    d.taux_chomage !== null ? `${d.taux_chomage}%` : "—"
                  ),
                },
                {
                  label: "Évolution 5 ans",
                  values: selectedData.map((d) =>
                    d.evolution_pop !== null
                      ? `${d.evolution_pop >= 0 ? "+" : ""}${d.evolution_pop}%`
                      : "—"
                  ),
                },
              ]}
              communes={selectedData.map((d) => d.commune)}
            />

            {/* Logement */}
            <ComparisonSection
              title="Logement"
              icon={<Home className="h-4 w-4" />}
              rows={[
                {
                  label: "Taux vacance",
                  values: selectedData.map((d) =>
                    d.taux_vacance !== null ? `${d.taux_vacance}%` : "—"
                  ),
                },
                {
                  label: "Logements sociaux",
                  values: selectedData.map((d) =>
                    d.nb_logements_sociaux.toLocaleString("fr-FR")
                  ),
                },
              ]}
              communes={selectedData.map((d) => d.commune)}
            />

            {/* Risques */}
            <ComparisonSection
              title="Risques"
              icon={<AlertTriangle className="h-4 w-4" />}
              rows={[
                {
                  label: "Nb risques identifiés",
                  values: selectedData.map((d) => String(d.nb_risques)),
                },
              ]}
              communes={selectedData.map((d) => d.commune)}
            />
          </div>
        )}

        {/* Empty state */}
        {selectedData.length < 2 && !loading && (
          <div className="text-center py-16">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Sélectionnez au moins 2 communes pour les comparer
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function ComparisonSection({
  title,
  icon,
  rows,
  communes,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Array<{
    label: string;
    values: string[];
    highlight?: boolean;
  }>;
  communes: string[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          {title}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium w-40">
                Indicateur
              </th>
              {communes.map((c) => (
                <th
                  key={c}
                  className="text-center px-4 py-3 text-xs font-semibold text-blue-600"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-50 ${
                  row.highlight ? "bg-blue-50/30" : ""
                }`}
              >
                <td className="px-6 py-3 text-sm text-gray-600">
                  {row.label}
                </td>
                {row.values.map((v, j) => (
                  <td
                    key={j}
                    className={`text-center px-4 py-3 text-sm ${
                      row.highlight
                        ? "font-bold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
