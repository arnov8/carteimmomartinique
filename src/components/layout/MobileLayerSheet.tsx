"use client";

import { useState } from "react";
import {
  X,
  Layers,
  Eye,
  EyeOff,
  Euro,
  Home,
  Square,
  Building,
  AlertTriangle,
  TrendingUp,
  Building2,
  Users,
  RotateCcw,
} from "lucide-react";
import type { LayerId } from "@/types";
import type { LayerFilters } from "@/components/layout/LeftSidebar";

interface MobileLayerSheetProps {
  activeLayers: Set<LayerId>;
  onToggleLayer: (id: LayerId) => void;
  currentZoom: number;
  filters: LayerFilters;
  onFiltersChange: (filters: LayerFilters) => void;
}

const LAYERS = [
  { id: "dvf" as LayerId, label: "Prix immobiliers (DVF)", color: "#22c55e", Icon: Euro, minZoom: 0 },
  { id: "annonces" as LayerId, label: "Annonces en cours", color: "#f97316", Icon: Home, minZoom: 0 },
  { id: "cadastre" as LayerId, label: "Cadastre parcellaire", color: "#6b7280", Icon: Square, minZoom: 14 },
  { id: "permis" as LayerId, label: "Permis de construire", color: "#3b82f6", Icon: Building, minZoom: 0 },
  { id: "risques" as LayerId, label: "Risques naturels", color: "#ef4444", Icon: AlertTriangle, minZoom: 0 },
  { id: "attractivite" as LayerId, label: "Score d'attractivité", color: "#84cc16", Icon: TrendingUp, minZoom: 0 },
  { id: "vacance" as LayerId, label: "Logements vacants", color: "#eab308", Icon: Building2, minZoom: 0 },
  { id: "social" as LayerId, label: "Parc social (RPLS)", color: "#8b5cf6", Icon: Users, minZoom: 0 },
];

export default function MobileLayerSheet({
  activeLayers,
  onToggleLayer,
  currentZoom,
  filters,
  onFiltersChange,
}: MobileLayerSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const resetFilters = () => {
    onFiltersChange({
      dvf: { priceMin: 0, priceMax: 10000, types: [] },
      annonces: { types: [] },
      permis: { decisions: [] },
    });
  };

  const hasActiveFilters =
    filters.dvf.priceMin > 0 ||
    filters.dvf.priceMax < 10000 ||
    filters.dvf.types.length > 0 ||
    filters.annonces.types.length > 0 ||
    filters.permis.decisions.length > 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-3 left-3 z-20 bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 hover:bg-gray-50 transition-colors"
        title="Couches"
      >
        <Layers className="h-5 w-5 text-gray-700" />
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet */}
      {isOpen && (
        <div className="md:hidden fixed inset-y-0 left-0 z-50 w-[300px] bg-white shadow-2xl animate-slide-in-left flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 font-heading">Couches de données</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Layer list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {LAYERS.map((layer) => {
              const isActive = activeLayers.has(layer.id);
              const needsZoom = layer.minZoom > 0 && currentZoom < layer.minZoom;

              return (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2.5 px-4 py-3 border-b border-gray-50 transition-colors ${
                    isActive ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isActive ? layer.color : "#d1d5db" }}
                  />
                  <span className={`flex-1 text-sm ${isActive ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                    {layer.label}
                  </span>
                  {isActive && needsZoom && (
                    <span className="text-[9px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-medium">
                      Zoomer
                    </span>
                  )}
                  <button
                    onClick={() => onToggleLayer(layer.id)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    {isActive ? (
                      <Eye className="h-4 w-4 text-blue-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-300" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Reset button */}
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                hasActiveFilters
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </>
  );
}
