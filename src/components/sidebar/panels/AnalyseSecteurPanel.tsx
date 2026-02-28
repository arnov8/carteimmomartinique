"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  Building,
  Users,
  Home,
  Euro,
  Calendar,
} from "lucide-react";
import { formatPriceFull, formatPriceM2, formatDate } from "@/lib/format";

interface AnalyseSecteurPanelProps {
  data: Record<string, unknown>;
}

interface SecteurData {
  commune: string;
  code_commune: string;
  dvf: {
    nb_transactions: number;
    prix_median_m2: number | null;
    prix_moyen_m2: number | null;
    dernieres_transactions: Array<{
      date: string;
      prix: number;
      prix_m2: number | null;
      type: string;
      surface: number | null;
    }>;
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
  permis: {
    nb_permis: number;
    nb_logements_total: number;
    projets: unknown[];
  };
  lovac: {
    nb_logements_vacants: number;
    taux_vacance: number;
  } | null;
  parc_social: {
    total_logements: number;
    bailleurs: unknown[];
  };
}

export default function AnalyseSecteurPanel({
  data,
}: AnalyseSecteurPanelProps) {
  const lng = data.lng as number;
  const lat = data.lat as number;
  const [loading, setLoading] = useState(true);
  const [secteur, setSecteur] = useState<SecteurData | null>(null);

  useEffect(() => {
    async function fetchAnalyse() {
      try {
        const res = await fetch(
          `/api/analyse-secteur?lng=${lng}&lat=${lat}&rayon=500`
        );
        if (!res.ok) throw new Error("Fetch error");
        const json = await res.json();
        setSecteur(json);
      } catch (e) {
        console.error("Analyse secteur error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalyse();
  }, [lng, lat]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" />
        </div>
        <p className="text-sm text-gray-500">Analyse du secteur en cours...</p>
      </div>
    );
  }

  if (!secteur) {
    return (
      <div className="p-4 bg-red-50 rounded-xl">
        <p className="text-sm text-red-600">
          Impossible de charger l&apos;analyse pour ce secteur.
        </p>
      </div>
    );
  }

  const niveauMax = secteur.risques.reduce((max, r) => {
    const order = { faible: 1, moyen: 2, fort: 3, tres_fort: 4 };
    const current = order[r.niveau as keyof typeof order] || 0;
    const prev = order[max as keyof typeof order] || 0;
    return current > prev ? r.niveau : max;
  }, "faible");

  return (
    <div className="space-y-5">
      {/* Commune */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">
            {secteur.commune || "Zone analysée"}
          </span>
        </div>
        <p className="text-xs text-blue-600">
          Rayon de 500m autour du point sélectionné
        </p>
      </div>

      {/* Prix immobiliers */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Euro className="h-3.5 w-3.5" /> Marché immobilier
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-900">
              {secteur.dvf.prix_median_m2
                ? formatPriceM2(secteur.dvf.prix_median_m2)
                : "—"}
            </p>
            <p className="text-[10px] text-gray-500">Prix médian /m²</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-900">
              {secteur.dvf.nb_transactions}
            </p>
            <p className="text-[10px] text-gray-500">Transactions récentes</p>
          </div>
        </div>

        {secteur.dvf.dernieres_transactions.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {secteur.dvf.dernieres_transactions.slice(0, 3).map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Home className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {t.type || "Bien"}
                    {t.surface ? ` · ${t.surface} m²` : ""}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-900">
                    {formatPriceFull(t.prix)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {t.date ? formatDate(t.date) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risques */}
      {secteur.risques.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Risques (
            {secteur.risques.length})
          </h3>
          <div className="space-y-2">
            {secteur.risques.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      r.niveau === "tres_fort"
                        ? "#ef4444"
                        : r.niveau === "fort"
                        ? "#f97316"
                        : r.niveau === "moyen"
                        ? "#eab308"
                        : "#22c55e",
                  }}
                />
                <span className="text-xs text-gray-700 capitalize">
                  {r.type_risque.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Démographie */}
      {secteur.insee && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Données socio-économiques
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-bold text-gray-900">
                {secteur.insee.population.toLocaleString("fr-FR")}
              </p>
              <p className="text-[10px] text-gray-500">Population</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm font-bold text-gray-900">
                {secteur.insee.revenu_median.toLocaleString("fr-FR")} €
              </p>
              <p className="text-[10px] text-gray-500">Revenu médian</p>
            </div>
            {secteur.insee.taux_chomage !== null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-bold text-gray-900">
                  {secteur.insee.taux_chomage}%
                </p>
                <p className="text-[10px] text-gray-500">Chômage</p>
              </div>
            )}
            {secteur.insee.evolution_population_5ans !== null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p
                  className={`text-sm font-bold ${
                    secteur.insee.evolution_population_5ans >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {secteur.insee.evolution_population_5ans >= 0 ? "+" : ""}
                  {secteur.insee.evolution_population_5ans}%
                </p>
                <p className="text-[10px] text-gray-500">Évolution 5 ans</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permis */}
      {secteur.permis.nb_permis > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5" /> Projets immobiliers
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">
                {secteur.permis.nb_permis}
              </p>
              <p className="text-[10px] text-gray-500">Permis accordés</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-gray-900">
                {secteur.permis.nb_logements_total}
              </p>
              <p className="text-[10px] text-gray-500">Logements prévus</p>
            </div>
          </div>
        </div>
      )}

      {/* Vacance & Social */}
      <div className="grid grid-cols-2 gap-3">
        {secteur.lovac && (
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-orange-700">
              {secteur.lovac.taux_vacance}%
            </p>
            <p className="text-[10px] text-orange-600">Vacance</p>
          </div>
        )}
        <div className="bg-violet-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-violet-700">
            {secteur.parc_social.total_logements}
          </p>
          <p className="text-[10px] text-violet-600">Logements sociaux</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        Sources : DVF, INSEE, Géorisques, Sitadel, LOVAC, RPLS
      </p>
    </div>
  );
}
