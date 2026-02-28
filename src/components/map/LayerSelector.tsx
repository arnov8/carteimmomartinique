"use client";

import { useState } from "react";
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Euro,
  Home,
  Map,
  Square,
  Building,
  AlertTriangle,
  TrendingUp,
  Building2,
  Users,
} from "lucide-react";
import { LAYER_CATEGORIES } from "@/lib/constants";
import type { LayerId } from "@/types";

const ICONS: Record<string, React.ReactNode> = {
  euro: <Euro className="h-3.5 w-3.5" />,
  home: <Home className="h-3.5 w-3.5" />,
  map: <Map className="h-3.5 w-3.5" />,
  square: <Square className="h-3.5 w-3.5" />,
  building: <Building className="h-3.5 w-3.5" />,
  "alert-triangle": <AlertTriangle className="h-3.5 w-3.5" />,
  "trending-up": <TrendingUp className="h-3.5 w-3.5" />,
  "building-2": <Building2 className="h-3.5 w-3.5" />,
  users: <Users className="h-3.5 w-3.5" />,
};

interface LayerSelectorProps {
  activeLayers: Set<LayerId>;
  onToggleLayer: (layerId: LayerId) => void;
}

export default function LayerSelector({
  activeLayers,
  onToggleLayer,
}: LayerSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["marche"])
  );

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const activeCount = activeLayers.size;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3.5 py-2.5 w-full hover:bg-gray-50 transition-colors"
      >
        <Layers className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-800">Couches</span>
        {activeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full">
            {activeCount}
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-gray-400 ml-auto" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 max-h-[60vh] overflow-y-auto custom-scrollbar animate-fade-in">
          {LAYER_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center justify-between w-full px-3.5 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {cat.label}
                </span>
                {expandedCategories.has(cat.id) ? (
                  <ChevronUp className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                )}
              </button>

              {expandedCategories.has(cat.id) && (
                <div className="py-1">
                  {cat.layers.map((layer) => {
                    const isActive = activeLayers.has(layer.id as LayerId);
                    return (
                      <button
                        key={layer.id}
                        onClick={() => onToggleLayer(layer.id as LayerId)}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <div
                          className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                            isActive
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-300 text-transparent"
                          }`}
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span
                          className={`${
                            isActive ? "text-blue-700" : "text-gray-500"
                          }`}
                        >
                          {ICONS[layer.icon]}
                        </span>
                        <span
                          className={`text-sm ${
                            isActive
                              ? "font-medium text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {layer.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
