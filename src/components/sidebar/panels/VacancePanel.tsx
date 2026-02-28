"use client";

import { Building2, TrendingDown, Clock, Calendar } from "lucide-react";

interface VacancePanelProps {
  data: Record<string, unknown>;
}

export default function VacancePanel({ data }: VacancePanelProps) {
  const commune = data.commune as string;
  const nbVacants = data.nb_logements_vacants as number;
  const taux = data.taux_vacance as number;
  const duree = data.duree_vacance_moyenne as number | null;
  const annee = data.annee as number;

  const tauxColor =
    taux < 5
      ? "text-green-600 bg-green-50"
      : taux < 10
      ? "text-yellow-600 bg-yellow-50"
      : taux < 15
      ? "text-orange-600 bg-orange-50"
      : "text-red-600 bg-red-50";

  const tauxLabel =
    taux < 5
      ? "Très faible"
      : taux < 10
      ? "Modéré"
      : taux < 15
      ? "Élevé"
      : "Critique";

  return (
    <div className="space-y-5">
      {/* Taux principal */}
      <div className={`rounded-xl p-4 text-center ${tauxColor}`}>
        <p className="text-3xl font-bold">{taux.toFixed(1)}%</p>
        <p className="text-sm font-medium mt-1">Taux de vacance — {tauxLabel}</p>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
              Logements vacants
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {nbVacants.toLocaleString("fr-FR")}
          </p>
        </div>

        {duree !== null && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Durée moyenne
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {duree.toFixed(1)} ans
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
              Année données
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900">{annee}</p>
        </div>
      </div>

      {/* Interprétation */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">
          Analyse
        </h3>
        <p className="text-sm text-blue-700 leading-relaxed">
          {taux >= 15 ? (
            <>
              Le taux de vacance à {commune} est particulièrement élevé, ce qui peut
              signaler un marché en difficulté mais aussi des opportunités d&apos;acquisition
              à prix réduit. Vérifiez l&apos;état des biens et les raisons de la vacance.
            </>
          ) : taux >= 10 ? (
            <>
              La vacance à {commune} dépasse la moyenne nationale. Cela peut représenter
              des opportunités pour des projets de rénovation ou de reconversion.
            </>
          ) : taux >= 5 ? (
            <>
              Le taux de vacance à {commune} reste modéré, signe d&apos;un marché
              relativement dynamique avec un renouvellement normal du parc.
            </>
          ) : (
            <>
              Très faible vacance à {commune}, signe d&apos;un marché tendu. La demande
              est forte, ce qui peut signifier des prix plus élevés mais une revente facilitée.
            </>
          )}
        </p>
      </div>

      {/* Source */}
      <p className="text-[10px] text-gray-400 text-center">
        Source : LOVAC {annee} — Logements vacants du parc privé
      </p>
    </div>
  );
}
