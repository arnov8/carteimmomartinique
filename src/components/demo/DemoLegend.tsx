"use client";

import type { LayerId } from "@/types";

interface DemoLegendProps {
  isLayerActive: (id: LayerId) => boolean;
}

export default function DemoLegend({ isLayerActive }: DemoLegendProps) {
  return (
    <>
      {isLayerActive("dvf") && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-fade-in">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Prix au m²
          </p>
          <div className="flex items-center gap-1">
            {[
              { color: "#22c55e", label: "< 1 500€" },
              { color: "#84cc16", label: "" },
              { color: "#eab308", label: "2 000€" },
              { color: "#f97316", label: "" },
              { color: "#ef4444", label: "3 000€" },
              { color: "#dc2626", label: "> 4 000€" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-5 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.label && <span className="text-[7px] text-gray-500 mt-0.5">{item.label}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("risques") && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 animate-fade-in">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Risques</p>
          <div className="flex items-center gap-1.5">
            {[{ color: "#22c55e", l: "Faible" }, { color: "#eab308", l: "Moyen" }, { color: "#f97316", l: "Fort" }, { color: "#ef4444", l: "Très fort" }].map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[8px] text-gray-600">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("permis") && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 animate-fade-in">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Permis</p>
          <div className="flex items-center gap-1.5">
            {[{ color: "#22c55e", l: "Accordé" }, { color: "#3b82f6", l: "En cours" }, { color: "#ef4444", l: "Refusé" }].map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[8px] text-gray-600">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("annonces") && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 animate-fade-in">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Annonces</p>
          <div className="flex items-center gap-1.5">
            {[{ color: "#f97316", l: "Maison" }, { color: "#3b82f6", l: "Appart." }, { color: "#22c55e", l: "Terrain" }, { color: "#8b5cf6", l: "Local" }].map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[8px] text-gray-600">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("vacance") && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 animate-fade-in">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Vacance</p>
          <div className="flex items-center gap-1">
            {[{ color: "#22c55e", l: "< 5%" }, { color: "#eab308", l: "10%" }, { color: "#ef4444", l: "> 20%" }].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-5 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[7px] text-gray-500 mt-0.5">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("social") && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 animate-fade-in">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Parc social</p>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-violet-500 opacity-50" />
            <span className="text-[8px] text-gray-600">Taille = nb logements</span>
          </div>
        </div>
      )}

      {isLayerActive("cadastre") && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 animate-fade-in">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Cadastre</p>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2.5 border border-gray-400 bg-transparent rounded-sm" />
            <span className="text-[8px] text-gray-600">Parcelles (zoom 14+)</span>
          </div>
        </div>
      )}

      {isLayerActive("attractivite") && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2.5 animate-fade-in">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Attractivité</p>
          <div className="flex items-center gap-1">
            {[{ color: "#ef4444", l: "< 35" }, { color: "#eab308", l: "50" }, { color: "#22c55e", l: "> 80" }].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-5 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[7px] text-gray-500 mt-0.5">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
