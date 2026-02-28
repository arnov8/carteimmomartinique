"use client";

import { TrendingUp, Users, Briefcase, Home, TreePine } from "lucide-react";

interface AttractivitePanelProps {
  data: Record<string, unknown>;
}

const DIMENSIONS = [
  {
    key: "demographie",
    label: "Démographie",
    icon: Users,
    description: "Évolution de la population",
  },
  {
    key: "economie",
    label: "Économie",
    icon: Briefcase,
    description: "Revenu et emploi",
  },
  {
    key: "immobilier",
    label: "Immobilier",
    icon: Home,
    description: "Dynamisme du marché",
  },
  {
    key: "cadre_vie",
    label: "Cadre de vie",
    icon: TreePine,
    description: "Équipements et services",
  },
];

function scoreToColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#84cc16";
  if (score >= 50) return "#eab308";
  if (score >= 35) return "#f97316";
  return "#ef4444";
}

function scoreToLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Bon";
  if (score >= 50) return "Moyen";
  if (score >= 35) return "Faible";
  return "Critique";
}

export default function AttractivitePanel({ data }: AttractivitePanelProps) {
  const commune = data.commune as string;
  const score = data.score as number;
  const details: Record<string, number> = JSON.parse(
    (data.details as string) || "{}"
  );

  const color = scoreToColor(score);
  const label = scoreToLabel(score);

  return (
    <div className="space-y-5">
      {/* Score global */}
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4"
          style={{ borderColor: color }}
        >
          <div>
            <p className="text-3xl font-bold" style={{ color }}>
              {score}
            </p>
            <p className="text-[10px] text-gray-500 font-medium">/100</p>
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold" style={{ color }}>
          {label}
        </p>
      </div>

      {/* Détails par dimension */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Détail par dimension
        </h3>
        <div className="space-y-3">
          {DIMENSIONS.map((dim) => {
            const value = details[dim.key] ?? 0;
            const dimColor = scoreToColor(value);
            const Icon = dim.icon;
            return (
              <div key={dim.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-700">
                        {dim.label}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-1.5">
                        {dim.description}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: dimColor }}
                  >
                    {value}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${value}%`,
                      backgroundColor: dimColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interprétation */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">
          Interprétation
        </h3>
        <p className="text-sm text-blue-700 leading-relaxed">
          {score >= 65 ? (
            <>
              {commune} affiche un bon score d&apos;attractivité. Cette commune
              bénéficie de fondamentaux solides pour un investissement immobilier,
              avec un bon équilibre entre dynamisme économique et qualité de vie.
            </>
          ) : score >= 50 ? (
            <>
              {commune} présente une attractivité correcte mais contrastée.
              Certains indicateurs sont encourageants tandis que d&apos;autres
              nécessitent de la vigilance. Étudiez le détail par dimension.
            </>
          ) : (
            <>
              L&apos;attractivité de {commune} est en dessous de la moyenne.
              Un investissement ici peut offrir des prix bas mais implique
              davantage de risques. Vérifiez les projets de développement en cours.
            </>
          )}
        </p>
      </div>

      {/* Méthodologie */}
      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Score calculé à partir de données INSEE (population, revenu, emploi),
          LOVAC (vacance) et RPLS (logement social). Pondération : économie 30%,
          démographie 25%, immobilier 25%, cadre de vie 20%.
        </p>
      </div>
    </div>
  );
}
