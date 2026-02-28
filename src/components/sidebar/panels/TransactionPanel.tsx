"use client";

import {
  Calendar,
  MapPin,
  Home,
  Ruler,
  DoorOpen,
  Banknote,
  TrendingUp,
  Layers,
} from "lucide-react";
import {
  formatPriceFull,
  formatPriceM2,
  formatSurface,
  formatDate,
  typeLocalLabel,
  priceToColor,
} from "@/lib/format";

interface TransactionPanelProps {
  data: Record<string, unknown>;
}

export default function TransactionPanel({ data }: TransactionPanelProps) {
  const prix = Number(data.valeur_fonciere) || 0;
  const prixM2 = Number(data.prix_m2) || 0;
  const surface = Number(data.surface_reelle_bati) || 0;
  const terrain = Number(data.surface_terrain) || 0;
  const pieces = Number(data.nombre_pieces) || 0;
  const typeLocal = String(data.type_local || "");
  const commune = String(data.commune || "");
  const adresse = String(data.adresse || "");
  const date = String(data.date_mutation || "");
  const nature = String(data.nature_mutation || "");

  return (
    <div className="space-y-4">
      {/* Prix principal */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
          Prix de vente
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {formatPriceFull(prix)}
        </p>
        {prixM2 > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: priceToColor(prixM2) }}
            />
            <span className="text-sm font-semibold text-gray-700">
              {formatPriceM2(prixM2)}
            </span>
          </div>
        )}
      </div>

      {/* Infos clés */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard
          icon={<Home className="h-4 w-4" />}
          label="Type"
          value={typeLocalLabel(typeLocal)}
        />
        <InfoCard
          icon={<Calendar className="h-4 w-4" />}
          label="Date"
          value={date ? formatDate(date) : "—"}
        />
        {surface > 0 && (
          <InfoCard
            icon={<Ruler className="h-4 w-4" />}
            label="Surface bâti"
            value={formatSurface(surface)}
          />
        )}
        {pieces > 0 && (
          <InfoCard
            icon={<DoorOpen className="h-4 w-4" />}
            label="Pièces"
            value={`${pieces} pièce${pieces > 1 ? "s" : ""}`}
          />
        )}
        {terrain > 0 && (
          <InfoCard
            icon={<Layers className="h-4 w-4" />}
            label="Terrain"
            value={formatSurface(terrain)}
          />
        )}
        <InfoCard
          icon={<Banknote className="h-4 w-4" />}
          label="Nature"
          value={nature}
        />
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

      {/* Note informative */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs text-amber-800">
          <strong>Source :</strong> DVF (Demandes de Valeurs Foncières) —
          Données publiques issues des actes notariés.
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
