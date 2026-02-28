"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/ui/Logo";
import SearchBar from "@/components/map/SearchBar";
import LayerSelector from "@/components/map/LayerSelector";
import Sidebar from "@/components/sidebar/Sidebar";
import DvfLayer from "@/components/layers/DvfLayer";
import RisquesLayer from "@/components/layers/RisquesLayer";
import PermisLayer from "@/components/layers/PermisLayer";
import VacanceLayer from "@/components/layers/VacanceLayer";
import SocialLayer from "@/components/layers/SocialLayer";
import AttractiviteLayer from "@/components/layers/AttractiviteLayer";
import AnnoncesLayer from "@/components/layers/AnnoncesLayer";
import { useMap } from "@/hooks/useMap";
import { useLayers } from "@/hooks/useLayers";
import type { SidebarContent } from "@/types";

const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
});

export default function Home() {
  const { mapRef, initializeMap, flyTo, isMapReady } = useMap();
  const { activeLayers, toggleLayer, isLayerActive } = useLayers();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<SidebarContent | null>(
    null
  );

  const handleSearchSelect = useCallback(
    (lng: number, lat: number, zoom?: number) => {
      flyTo(lng, lat, zoom);
    },
    [flyTo]
  );

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
    setSidebarContent(null);
  }, []);

  const handleFeatureClick = useCallback((content: SidebarContent) => {
    setSidebarContent(content);
    setSidebarOpen(true);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Carte */}
      <MapContainer onMapInit={initializeMap} />

      {/* Couches de données */}
      {isMapReady && (
        <>
          <DvfLayer
            map={mapRef.current}
            isActive={isLayerActive("dvf")}
            onFeatureClick={handleFeatureClick}
          />
          <RisquesLayer
            map={mapRef.current}
            isActive={isLayerActive("risques")}
            onFeatureClick={handleFeatureClick}
          />
          <PermisLayer
            map={mapRef.current}
            isActive={isLayerActive("permis")}
            onFeatureClick={handleFeatureClick}
          />
          <VacanceLayer
            map={mapRef.current}
            isActive={isLayerActive("vacance")}
            onFeatureClick={handleFeatureClick}
          />
          <SocialLayer
            map={mapRef.current}
            isActive={isLayerActive("social")}
            onFeatureClick={handleFeatureClick}
          />
          <AttractiviteLayer
            map={mapRef.current}
            isActive={isLayerActive("attractivite")}
            onFeatureClick={handleFeatureClick}
          />
          <AnnoncesLayer
            map={mapRef.current}
            isActive={isLayerActive("annonces")}
            onFeatureClick={handleFeatureClick}
          />
        </>
      )}

      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-start justify-between p-3 gap-3">
          {/* Logo + Search */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
              <Logo size="md" />
            </div>
            <div className="hidden sm:block">
              <SearchBar onSelect={handleSearchSelect} />
            </div>
          </div>

          {/* Layer selector */}
          <div className="pointer-events-auto">
            <LayerSelector
              activeLayers={activeLayers}
              onToggleLayer={toggleLayer}
            />
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="sm:hidden px-3 pointer-events-auto">
          <SearchBar onSelect={handleSearchSelect} />
        </div>
      </div>

      {/* Loading indicator */}
      {!isMapReady && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <Logo size="lg" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" />
            </div>
            <p className="text-sm text-gray-500">
              Chargement de la carte...
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        content={sidebarContent}
      />

      {/* Légendes dynamiques */}
      {isMapReady && (
        <div className="absolute bottom-10 left-3 z-10 pointer-events-auto space-y-2">
          {/* Légende DVF */}
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
                    <div
                      className="w-6 h-2.5 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label && (
                      <span className="text-[8px] text-gray-500 mt-0.5">
                        {item.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Légende Risques */}
          {isLayerActive("risques") && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-fade-in">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Niveau de risque
              </p>
              <div className="flex items-center gap-2">
                {[
                  { color: "#22c55e", label: "Faible" },
                  { color: "#eab308", label: "Moyen" },
                  { color: "#f97316", label: "Fort" },
                  { color: "#ef4444", label: "Très fort" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[9px] text-gray-600">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Légende Permis */}
          {isLayerActive("permis") && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-fade-in">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Permis de construire
              </p>
              <div className="flex items-center gap-2">
                {[
                  { color: "#22c55e", label: "Accordé" },
                  { color: "#3b82f6", label: "En cours" },
                  { color: "#ef4444", label: "Refusé" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[9px] text-gray-600">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Légende Vacance */}
          {isLayerActive("vacance") && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-fade-in">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Taux de vacance
              </p>
              <div className="flex items-center gap-1">
                {[
                  { color: "#22c55e", label: "< 5%" },
                  { color: "#84cc16", label: "" },
                  { color: "#eab308", label: "10%" },
                  { color: "#f97316", label: "" },
                  { color: "#ef4444", label: "> 20%" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-6 h-2.5 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label && (
                      <span className="text-[8px] text-gray-500 mt-0.5">
                        {item.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Légende Parc Social */}
          {isLayerActive("social") && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-fade-in">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Parc social (RPLS)
              </p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500 opacity-50" />
                <span className="text-[9px] text-gray-600">
                  Taille = nb logements
                </span>
              </div>
            </div>
          )}

          {/* Légende Annonces */}
          {isLayerActive("annonces") && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-fade-in">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Annonces en cours
              </p>
              <div className="flex items-center gap-2">
                {[
                  { color: "#f97316", label: "Maison" },
                  { color: "#3b82f6", label: "Appart." },
                  { color: "#22c55e", label: "Terrain" },
                  { color: "#8b5cf6", label: "Local" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[9px] text-gray-600">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Légende Attractivité */}
          {isLayerActive("attractivite") && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-fade-in">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Score d&apos;attractivité
              </p>
              <div className="flex items-center gap-1">
                {[
                  { color: "#ef4444", label: "< 35" },
                  { color: "#f97316", label: "" },
                  { color: "#eab308", label: "50" },
                  { color: "#84cc16", label: "" },
                  { color: "#22c55e", label: "> 80" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-6 h-2.5 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label && (
                      <span className="text-[8px] text-gray-500 mt-0.5">
                        {item.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attribution footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex justify-between items-end p-2">
          <div />
          <div className="pointer-events-auto">
            <p className="text-[9px] text-gray-500 bg-white/70 px-1.5 py-0.5 rounded">
              Sources : DVF, INSEE, Géorisques, GPU, Cadastre Etalab | ©
              CarteImmoMartinique 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
