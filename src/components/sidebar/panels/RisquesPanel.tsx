"use client";

import {
  AlertTriangle,
  Mountain,
  Waves,
  Landmark,
  CircleAlert,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";

interface RisquesPanelProps {
  data: Record<string, unknown>;
}

interface Risque {
  type_risque: string;
  niveau: string;
  description: string;
  source: string;
}

const NIVEAU_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  faible: {
    label: "Faible",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  moyen: {
    label: "Moyen",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
  fort: {
    label: "Fort",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  tres_fort: {
    label: "Très fort",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  sismique: {
    label: "Sismique",
    icon: <CircleAlert className="h-4 w-4" />,
    color: "#8b5cf6",
  },
  volcanique: {
    label: "Volcanique",
    icon: <Mountain className="h-4 w-4" />,
    color: "#dc2626",
  },
  inondation: {
    label: "Inondation",
    icon: <Waves className="h-4 w-4" />,
    color: "#3b82f6",
  },
  submersion_marine: {
    label: "Submersion marine",
    icon: <Waves className="h-4 w-4" />,
    color: "#1e3a5f",
  },
  mouvement_terrain: {
    label: "Mouvement de terrain",
    icon: <Landmark className="h-4 w-4" />,
    color: "#92400e",
  },
};

export default function RisquesPanel({ data }: RisquesPanelProps) {
  const commune = String(data.commune || "");
  const niveauMax = String(data.niveau_max || "moyen");
  const nbRisques = Number(data.nb_risques) || 0;

  let risques: Risque[] = [];
  try {
    const raw = data.risques;
    if (typeof raw === "string") {
      risques = JSON.parse(raw);
    } else if (Array.isArray(raw)) {
      risques = raw as Risque[];
    }
  } catch {
    risques = [];
  }

  const niveauConf = NIVEAU_CONFIG[niveauMax] || NIVEAU_CONFIG.moyen;

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div
        className={`${niveauConf.bg} ${niveauConf.border} border rounded-xl p-4`}
      >
        <div className="flex items-center gap-2 mb-2">
          {niveauMax === "fort" || niveauMax === "tres_fort" ? (
            <ShieldAlert className={`h-5 w-5 ${niveauConf.color}`} />
          ) : (
            <ShieldCheck className={`h-5 w-5 ${niveauConf.color}`} />
          )}
          <span className={`text-sm font-bold ${niveauConf.color}`}>
            Niveau de risque global : {niveauConf.label}
          </span>
        </div>
        <p className="text-xs text-gray-600">
          {nbRisques} type{nbRisques > 1 ? "s" : ""} de risque
          {nbRisques > 1 ? "s" : ""} identifié{nbRisques > 1 ? "s" : ""} sur la
          commune de {commune}.
        </p>
      </div>

      {/* Détail par risque */}
      <div className="space-y-2.5">
        {risques.map((risque, i) => {
          const typeConf = TYPE_CONFIG[risque.type_risque];
          const nivConf = NIVEAU_CONFIG[risque.niveau] || NIVEAU_CONFIG.moyen;

          return (
            <div
              key={i}
              className={`border ${nivConf.border} rounded-xl p-3.5 ${nivConf.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ color: typeConf?.color || "#6b7280" }}>
                    {typeConf?.icon || (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {typeConf?.label || risque.type_risque}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${nivConf.color} ${nivConf.bg} border ${nivConf.border}`}
                >
                  {nivConf.label}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {risque.description}
              </p>
              {risque.source && (
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Source : {risque.source}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Impact immobilier */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
        <h4 className="text-xs font-bold text-blue-800 mb-1">
          Impact sur la valeur immobilière
        </h4>
        <p className="text-xs text-blue-700 leading-relaxed">
          {niveauMax === "tres_fort" || niveauMax === "fort"
            ? "Un niveau de risque élevé peut impacter significativement la valeur des biens et les conditions d'assurance. Les acheteurs doivent intégrer ce facteur dans leur évaluation."
            : "Un niveau de risque modéré est courant dans les zones tropicales. L'impact sur la valeur immobilière reste limité mais les conditions d'assurance peuvent varier."}
        </p>
      </div>

      {/* Lien Géorisques */}
      <a
        href={`https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">
          Consulter Géorisques.gouv.fr pour plus de détails
        </span>
      </a>
    </div>
  );
}
