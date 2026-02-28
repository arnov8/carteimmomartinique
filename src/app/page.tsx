"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/ui/Logo";
import SearchBar from "@/components/map/SearchBar";
import LayerSelector from "@/components/map/LayerSelector";
import Sidebar from "@/components/sidebar/Sidebar";
import DvfLayer from "@/components/layers/DvfLayer";
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

      {/* Legend (quand DVF est active) */}
      {isMapReady && isLayerActive("dvf") && (
        <div className="absolute bottom-10 left-3 z-10 pointer-events-auto animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
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
