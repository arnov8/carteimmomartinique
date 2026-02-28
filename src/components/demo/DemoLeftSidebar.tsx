"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  SlidersHorizontal,
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
import Logo from "@/components/ui/Logo";
import type { LayerId } from "@/types";

interface LayerFilters {
  dvf: { priceMin: number; priceMax: number; types: string[] };
  annonces: { types: string[] };
  permis: { decisions: string[] };
}

interface DemoLeftSidebarProps {
  activeLayers: Set<LayerId>;
  onToggleLayer: (id: LayerId) => void;
  currentZoom: number;
  filters: LayerFilters;
  onFiltersChange: (filters: LayerFilters) => void;
}

const LAYERS = [
  { id: "dvf" as LayerId, label: "Prix immobiliers (DVF)", color: "#22c55e", Icon: Euro, minZoom: 0, hasFilters: true },
  { id: "annonces" as LayerId, label: "Annonces en cours", color: "#f97316", Icon: Home, minZoom: 0, hasFilters: true },
  { id: "cadastre" as LayerId, label: "Cadastre parcellaire", color: "#6b7280", Icon: Square, minZoom: 14, hasFilters: false },
  { id: "permis" as LayerId, label: "Permis de construire", color: "#3b82f6", Icon: Building, minZoom: 0, hasFilters: true },
  { id: "risques" as LayerId, label: "Risques naturels", color: "#ef4444", Icon: AlertTriangle, minZoom: 0, hasFilters: false },
  { id: "attractivite" as LayerId, label: "Score d'attractivité", color: "#84cc16", Icon: TrendingUp, minZoom: 0, hasFilters: false },
  { id: "vacance" as LayerId, label: "Logements vacants", color: "#eab308", Icon: Building2, minZoom: 0, hasFilters: false },
  { id: "social" as LayerId, label: "Parc social (RPLS)", color: "#8b5cf6", Icon: Users, minZoom: 0, hasFilters: false },
];

const DVF_TYPES = ["Maison", "Appartement"];
const ANNONCE_TYPES = [
  { value: "maison", label: "Maison" },
  { value: "appartement", label: "Appart." },
  { value: "terrain", label: "Terrain" },
  { value: "local_commercial", label: "Local" },
];
const PERMIS_DECISIONS = [
  { value: "accorde", label: "Accordé", color: "#22c55e" },
  { value: "en_cours", label: "En cours", color: "#3b82f6" },
  { value: "refuse", label: "Refusé", color: "#ef4444" },
];

export default function DemoLeftSidebar({
  activeLayers,
  onToggleLayer,
  currentZoom,
  filters,
  onFiltersChange,
}: DemoLeftSidebarProps) {
  const [expandedFilter, setExpandedFilter] = useState<LayerId | null>(null);

  const toggleFilter = (id: LayerId) => {
    setExpandedFilter((prev) => (prev === id ? null : id));
  };

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
    <div className="hidden md:flex flex-col w-[280px] h-full bg-white border-r border-gray-200 flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
            DÉMO
          </span>
        </div>
      </div>

      {/* Section title */}
      <div className="px-4 py-2.5 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Couches de données
        </h3>
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {LAYERS.map((layer) => {
          const isActive = activeLayers.has(layer.id);
          const needsZoom = layer.minZoom > 0 && currentZoom < layer.minZoom;

          return (
            <div key={layer.id}>
              {/* Layer row */}
              <div
                className={`flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-50 transition-colors ${
                  isActive ? "bg-blue-50/50" : "hover:bg-gray-50"
                }`}
              >
                {/* Color dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isActive ? layer.color : "#d1d5db" }}
                />

                {/* Label */}
                <span
                  className={`flex-1 text-sm ${
                    isActive ? "text-gray-900 font-medium" : "text-gray-600"
                  }`}
                >
                  {layer.label}
                </span>

                {/* Zoom badge */}
                {isActive && needsZoom && (
                  <span className="text-[9px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                    Zoomer
                  </span>
                )}

                {/* Eye toggle */}
                <button
                  onClick={() => onToggleLayer(layer.id)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
                  title={isActive ? "Masquer" : "Afficher"}
                >
                  {isActive ? (
                    <Eye className="h-4 w-4 text-blue-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-300" />
                  )}
                </button>

                {/* Filter toggle */}
                {layer.hasFilters && (
                  <button
                    onClick={() => toggleFilter(layer.id)}
                    className={`p-1 rounded transition-colors flex-shrink-0 ${
                      expandedFilter === layer.id
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100 text-gray-400"
                    }`}
                    title="Filtres"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Inline filter sub-panel */}
              {expandedFilter === layer.id && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 animate-fade-in">
                  {layer.id === "dvf" && (
                    <DvfFilters
                      filters={filters.dvf}
                      onChange={(dvf) => onFiltersChange({ ...filters, dvf })}
                    />
                  )}
                  {layer.id === "annonces" && (
                    <AnnonceFilters
                      filters={filters.annonces}
                      onChange={(annonces) => onFiltersChange({ ...filters, annonces })}
                    />
                  )}
                  {layer.id === "permis" && (
                    <PermisFilters
                      filters={filters.permis}
                      onChange={(permis) => onFiltersChange({ ...filters, permis })}
                    />
                  )}
                </div>
              )}
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
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}

// ── Sub-filter components ──────────────────────────────────────────────────

function DvfFilters({
  filters,
  onChange,
}: {
  filters: LayerFilters["dvf"];
  onChange: (f: LayerFilters["dvf"]) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Prix au m²
        </label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ""}
            onChange={(e) => onChange({ ...filters, priceMin: Number(e.target.value) || 0 })}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <span className="text-gray-400 text-xs">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax >= 10000 ? "" : filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) || 10000 })}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Type de bien
        </label>
        <div className="flex gap-1.5 mt-1">
          {DVF_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                const types = filters.types.includes(type)
                  ? filters.types.filter((t) => t !== type)
                  : [...filters.types, type];
                onChange({ ...filters, types });
              }}
              className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors ${
                filters.types.includes(type)
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnonceFilters({
  filters,
  onChange,
}: {
  filters: LayerFilters["annonces"];
  onChange: (f: LayerFilters["annonces"]) => void;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
        Type de bien
      </label>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {ANNONCE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              const types = filters.types.includes(type.value)
                ? filters.types.filter((t) => t !== type.value)
                : [...filters.types, type.value];
              onChange({ types });
            }}
            className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors ${
              filters.types.includes(type.value)
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PermisFilters({
  filters,
  onChange,
}: {
  filters: LayerFilters["permis"];
  onChange: (f: LayerFilters["permis"]) => void;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
        Décision
      </label>
      <div className="flex gap-1.5 mt-1">
        {PERMIS_DECISIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => {
              const decisions = filters.decisions.includes(d.value)
                ? filters.decisions.filter((v) => v !== d.value)
                : [...filters.decisions, d.value];
              onChange({ decisions });
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors ${
              filters.decisions.includes(d.value)
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
            }`}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { LayerFilters };
