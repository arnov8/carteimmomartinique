"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Home,
  Building,
  LandPlot,
} from "lucide-react";
import { formatPriceM2 } from "@/lib/format";

interface ZoneStatsPanelProps {
  data: Record<string, unknown>;
}

interface CommuneStats {
  code_commune: string;
  commune: string;
  nb_transactions: number;
  prix_median_m2: number;
  prix_moyen_m2: number;
  par_type: Array<{ type: string; count: number; prix_median_m2: number }>;
  par_annee: Array<{ year: string; count: number; prix_median_m2: number }>;
}

export default function ZoneStatsPanel({ data }: ZoneStatsPanelProps) {
  const [stats, setStats] = useState<CommuneStats | null>(null);
  const [loading, setLoading] = useState(true);
  const codeCommune = String(data.code_commune || "");
  const commune = String(data.commune || "");

  useEffect(() => {
    if (!codeCommune) return;

    setLoading(true);
    fetch(`/api/dvf/stats?code_commune=${codeCommune}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.stats && d.stats.length > 0) {
          setStats(d.stats[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [codeCommune]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          Pas de données DVF disponibles pour {commune}
        </p>
      </div>
    );
  }

  // Calculer la tendance
  const years = stats.par_annee;
  let trend = 0;
  if (years.length >= 2) {
    const last = years[years.length - 1].prix_median_m2;
    const prev = years[years.length - 2].prix_median_m2;
    if (prev > 0) trend = ((last - prev) / prev) * 100;
  }

  const typeIcons: Record<string, React.ReactNode> = {
    Maison: <Home className="h-3.5 w-3.5" />,
    Appartement: <Building className="h-3.5 w-3.5" />,
  };

  return (
    <div className="space-y-4">
      {/* Prix médian principal */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
          Prix médian au m²
        </p>
        <div className="flex items-end gap-3">
          <p className="text-2xl font-bold text-gray-900">
            {formatPriceM2(stats.prix_median_m2)}
          </p>
          {trend !== 0 && (
            <div
              className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                trend > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {stats.nb_transactions} transactions enregistrées
        </p>
      </div>

      {/* Évolution par année */}
      {years.length > 1 && (
        <div className="border border-gray-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Évolution des prix
          </h3>
          <div className="space-y-2">
            {years.map((y) => {
              const maxPrice = Math.max(...years.map((yr) => yr.prix_median_m2));
              const barWidth =
                maxPrice > 0 ? (y.prix_median_m2 / maxPrice) * 100 : 0;

              return (
                <div key={y.year} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-10 flex-shrink-0">
                    {y.year}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-20 text-right">
                    {formatPriceM2(y.prix_median_m2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Par type de bien */}
      {stats.par_type.length > 0 && (
        <div className="border border-gray-100 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Par type de bien
          </h3>
          <div className="space-y-2.5">
            {stats.par_type.map((t) => (
              <div
                key={t.type}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">
                    {typeIcons[t.type] || (
                      <LandPlot className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="text-sm text-gray-700">
                    {t.type || "Autre"}
                  </span>
                  <span className="text-xs text-gray-400">({t.count})</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPriceM2(t.prix_median_m2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source */}
      <p className="text-[10px] text-gray-400 text-center">
        Source : DVF — Données publiques des actes notariés
      </p>
    </div>
  );
}
