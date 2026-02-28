"use client";

import type { LayerId } from "@/types";

interface LegendProps {
  isLayerActive: (id: LayerId) => boolean;
}

export default function Legend({ isLayerActive }: LegendProps) {
  return (
    <>
      {isLayerActive("dvf") && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 animate-fade-in">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Prix au m²
          </p>
          <div className="flex items-end gap-2.5">
            {[
              { color: "#22c55e", label: "< 1 500€" },
              { color: "#84cc16", label: "" },
              { color: "#eab308", label: "2 000€" },
              { color: "#f97316", label: "" },
              { color: "#ef4444", label: "3 000€" },
              { color: "#dc2626", label: "> 4 000€" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-12 h-5 rounded-lg"
                  style={{ backgroundColor: item.color }}
                />
                {item.label && (
                  <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("risques") && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 animate-fade-in">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Risques
          </p>
          <div className="flex items-center gap-5">
            {[
              { color: "#22c55e", l: "Faible" },
              { color: "#eab308", l: "Moyen" },
              { color: "#f97316", l: "Fort" },
              { color: "#ef4444", l: "Très fort" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600 font-medium">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("permis") && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 animate-fade-in">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Permis
          </p>
          <div className="flex items-center gap-5">
            {[
              { color: "#22c55e", l: "Accordé" },
              { color: "#3b82f6", l: "En cours" },
              { color: "#ef4444", l: "Refusé" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600 font-medium">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("annonces") && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 animate-fade-in">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Annonces
          </p>
          <div className="flex items-center gap-5">
            {[
              { color: "#f97316", l: "Maison" },
              { color: "#3b82f6", l: "Appart." },
              { color: "#22c55e", l: "Terrain" },
              { color: "#8b5cf6", l: "Local" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600 font-medium">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("vacance") && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 animate-fade-in">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Vacance
          </p>
          <div className="flex items-end gap-2.5">
            {[
              { color: "#22c55e", l: "< 5%" },
              { color: "#84cc16", l: "" },
              { color: "#eab308", l: "10%" },
              { color: "#f97316", l: "" },
              { color: "#ef4444", l: "> 20%" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-5 rounded-lg" style={{ backgroundColor: item.color }} />
                {item.l && <span className="text-xs text-gray-500 font-semibold">{item.l}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {isLayerActive("social") && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 animate-fade-in">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Parc social
          </p>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500 opacity-60" />
            <span className="text-sm text-gray-600 font-medium">Taille = nb logements</span>
          </div>
        </div>
      )}

      {isLayerActive("cadastre") && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 animate-fade-in">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Cadastre
          </p>
          <div className="flex items-center gap-3">
            <div className="w-7 h-6 border-2 border-gray-400 bg-transparent rounded" />
            <span className="text-sm text-gray-600 font-medium">Parcelles (zoom 14+)</span>
          </div>
        </div>
      )}

      {isLayerActive("attractivite") && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-6 py-5 animate-fade-in">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Attractivité
          </p>
          <div className="flex items-end gap-2.5">
            {[
              { color: "#ef4444", l: "< 35" },
              { color: "#f97316", l: "" },
              { color: "#eab308", l: "50" },
              { color: "#84cc16", l: "" },
              { color: "#22c55e", l: "> 80" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-5 rounded-lg" style={{ backgroundColor: item.color }} />
                {item.l && <span className="text-xs text-gray-500 font-semibold">{item.l}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
