"use client";

import {
  Calendar,
  MapPin,
  Building,
  Home,
  Factory,
  Warehouse,
  CheckCircle2,
  XCircle,
  Clock,
  Ruler,
  Users,
  Hammer,
} from "lucide-react";
import { formatDate, formatSurface } from "@/lib/format";

interface PermisPanelProps {
  data: Record<string, unknown>;
}

const DECISION_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  accorde: {
    label: "Accordé",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  refuse: {
    label: "Refusé",
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-700",
    bg: "bg-red-50",
  },
  en_cours: {
    label: "En cours d'instruction",
    icon: <Clock className="h-4 w-4" />,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
};

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  individuel: { label: "Maison individuelle", icon: <Home className="h-4 w-4" /> },
  collectif: { label: "Logement collectif", icon: <Building className="h-4 w-4" /> },
  tertiaire: { label: "Tertiaire / Commercial", icon: <Warehouse className="h-4 w-4" /> },
  industriel: { label: "Industriel", icon: <Factory className="h-4 w-4" /> },
};

const NATURE_LABELS: Record<string, string> = {
  construction_neuve: "Construction neuve",
  extension: "Extension",
  renovation: "Rénovation",
  demolition: "Démolition",
};

export default function PermisPanel({ data }: PermisPanelProps) {
  const decision = String(data.decision || "en_cours");
  const typeConstruction = String(data.type_construction || "individuel");
  const natureTravaux = String(data.nature_travaux || "");
  const nbLogements = Number(data.nombre_logements) || 0;
  const surfacePlancher = Number(data.surface_plancher) || 0;
  const commune = String(data.commune || "");
  const adresse = String(data.adresse || "");
  const dateDepot = String(data.date_depot || "");
  const dateDecision = String(data.date_decision || "");
  const numeroPermis = String(data.numero_permis || "");

  const decConf = DECISION_CONFIG[decision] || DECISION_CONFIG.en_cours;
  const typeConf = TYPE_CONFIG[typeConstruction] || TYPE_CONFIG.individuel;

  return (
    <div className="space-y-4">
      {/* Statut */}
      <div className={`${decConf.bg} rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={decConf.color}>{decConf.icon}</span>
          <span className={`text-sm font-bold ${decConf.color}`}>
            {decConf.label}
          </span>
        </div>
        {numeroPermis && (
          <p className="text-xs text-gray-500">N° {numeroPermis}</p>
        )}
      </div>

      {/* Infos clés */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard
          icon={typeConf.icon}
          label="Type"
          value={typeConf.label}
        />
        <InfoCard
          icon={<Hammer className="h-4 w-4" />}
          label="Nature"
          value={NATURE_LABELS[natureTravaux] || natureTravaux}
        />
        {nbLogements > 0 && (
          <InfoCard
            icon={<Users className="h-4 w-4" />}
            label="Logements"
            value={`${nbLogements} logement${nbLogements > 1 ? "s" : ""}`}
          />
        )}
        {surfacePlancher > 0 && (
          <InfoCard
            icon={<Ruler className="h-4 w-4" />}
            label="Surface plancher"
            value={formatSurface(surfacePlancher)}
          />
        )}
        {dateDepot && (
          <InfoCard
            icon={<Calendar className="h-4 w-4" />}
            label="Dépôt"
            value={formatDate(dateDepot)}
          />
        )}
        {dateDecision && (
          <InfoCard
            icon={<Calendar className="h-4 w-4" />}
            label="Décision"
            value={formatDate(dateDecision)}
          />
        )}
      </div>

      {/* Localisation */}
      <div className="border border-gray-100 rounded-xl p-3.5">
        <div className="flex items-start gap-2.5">
          <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            {adresse && (
              <p className="text-sm font-medium text-gray-900">{adresse}</p>
            )}
            <p className="text-sm text-gray-500">{commune}</p>
          </div>
        </div>
      </div>

      {/* Source */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-800">
          <strong>Source :</strong> Sitadel — Base des permis de construire,
          Ministère de la Transition écologique.
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
