"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Logo from "@/components/ui/Logo";
import SearchBar from "@/components/map/SearchBar";
import LayerSelector from "@/components/map/LayerSelector";
import Sidebar from "@/components/sidebar/Sidebar";
import { useMap } from "@/hooks/useMap";
import { useLayers } from "@/hooks/useLayers";
import type { SidebarContent } from "@/types";

const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
});

export default function Home() {
  const { initializeMap, flyTo, isMapReady } = useMap();
  const { activeLayers, toggleLayer } = useLayers();
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

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Carte */}
      <MapContainer onMapInit={initializeMap} />

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
