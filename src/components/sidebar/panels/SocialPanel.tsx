"use client";

import { Users, Building, Home } from "lucide-react";

interface SocialPanelProps {
  data: Record<string, unknown>;
}

export default function SocialPanel({ data }: SocialPanelProps) {
  const commune = data.commune as string;
  const total = data.total as number;
  const bailleurs: Array<{ nom: string; nb: number }> = JSON.parse(
    (data.bailleurs as string) || "[]"
  );

  // Sort by count descending
  const sorted = [...bailleurs].sort((a, b) => b.nb - a.nb);
  const maxNb = sorted[0]?.nb || 1;

  const BAILLEUR_COLORS = [
    "#8b5cf6",
    "#6366f1",
    "#3b82f6",
    "#0ea5e9",
    "#14b8a6",
    "#22c55e",
  ];

  return (
    <div className="space-y-5">
      {/* Total */}
      <div className="bg-violet-50 rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-violet-700">
          {total.toLocaleString("fr-FR")}
        </p>
        <p className="text-sm font-medium text-violet-600 mt-1">
          logements sociaux
        </p>
      </div>

      {/* Répartition par bailleur */}
      {sorted.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Par bailleur
          </h3>
          <div className="space-y-2.5">
            {sorted.map((b, i) => {
              const pct = total > 0 ? (b.nb / total) * 100 : 0;
              const color = BAILLEUR_COLORS[i % BAILLEUR_COLORS.length];
              return (
                <div key={b.nom}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building
                        className="h-3.5 w-3.5 flex-shrink-0"
                        style={{ color }}
                      />
                      <span className="text-sm text-gray-700 truncate">
                        {b.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900">
                        {b.nb.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(b.nb / maxNb) * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          A propos
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Le parc social de {commune} comprend {total.toLocaleString("fr-FR")} logements
          gérés par {sorted.length} bailleur{sorted.length > 1 ? "s" : ""} sociaux.
          {total > 1000
            ? " C'est une commune avec une offre significative de logements sociaux."
            : total > 300
            ? " L'offre est modérée par rapport aux grandes communes."
            : " L'offre reste limitée sur cette commune."}
        </p>
      </div>

      {/* Source */}
      <p className="text-[10px] text-gray-400 text-center">
        Source : RPLS — Répertoire du Parc Locatif Social
      </p>
    </div>
  );
}
