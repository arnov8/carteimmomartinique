"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/map/SearchBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import type { LayerFilters } from "@/components/layout/LeftSidebar";
import RightPanel, { RightPanelMobile } from "@/components/layout/RightPanel";
import type { SelectedFeature, TabCounts } from "@/components/layout/RightPanel";
import Legend from "@/components/layout/Legend";
import MobileLayerSheet from "@/components/layout/MobileLayerSheet";
import DvfLayer from "@/components/layers/DvfLayer";
import RisquesLayer from "@/components/layers/RisquesLayer";
import PermisLayer from "@/components/layers/PermisLayer";
import VacanceLayer from "@/components/layers/VacanceLayer";
import SocialLayer from "@/components/layers/SocialLayer";
import AttractiviteLayer from "@/components/layers/AttractiviteLayer";
import AnnoncesLayer from "@/components/layers/AnnoncesLayer";
import CadastreLayer from "@/components/layers/CadastreLayer";
import Logo from "@/components/ui/Logo";
import { useMap } from "@/hooks/useMap";
import { useLayers } from "@/hooks/useLayers";
import type { SidebarContent } from "@/types";

const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
});

const DEFAULT_FILTERS: LayerFilters = {
  dvf: { priceMin: 0, priceMax: 10000, types: [] },
  annonces: { types: [] },
  permis: { decisions: [] },
};

export default function Home() {
  const { mapRef, initializeMap, flyTo, isMapReady, viewState } = useMap();
  const { activeLayers, toggleLayer, isLayerActive } = useLayers();

  // Filters
  const [filters, setFilters] = useState<LayerFilters>(DEFAULT_FILTERS);

  // Right panel state
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);
  const [tabCounts, setTabCounts] = useState<TabCounts>({
    transactions: 0,
    risques: 0,
    permis: 0,
    annonces: 0,
    vacance: 0,
    social: 0,
    attractivite: 0,
  });

  const handleSearchSelect = useCallback(
    (lng: number, lat: number, zoom?: number) => {
      flyTo(lng, lat, zoom);
    },
    [flyTo]
  );

  const handleClosePanel = useCallback(() => {
    setRightPanelOpen(false);
    setSelectedFeature(null);
  }, []);

  // Resize map when right panel opens/closes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const timer = setTimeout(() => map.resize(), 50);
    return () => clearTimeout(timer);
  }, [rightPanelOpen, mapRef]);

  // Unified feature click handler — fetches all related data for the commune
  const handleFeatureClick = useCallback(async (content: SidebarContent) => {
    const commune = (content.data.commune as string) || "";
    if (!commune) return;

    const address = (content.data.adresse as string) || commune;

    // Determine clicked type for tab auto-selection
    const clickedType = content.type === "analyse"
      ? (content.data.panel as string) || "transaction"
      : content.type;

    // Set initial feature immediately (responsive feel)
    const initialFeature: SelectedFeature = {
      commune,
      address,
      clickedType,
      clickedData: content.data,
      transactionData: content.type === "transaction" ? content.data : undefined,
      risquesData: content.type === "risque" ? content.data : undefined,
      permisData: content.type === "permis" ? content.data : undefined,
      annonceData: content.type === "annonce" ? content.data : undefined,
    };

    setSelectedFeature(initialFeature);
    setTabCounts({
      transactions: content.type === "transaction" ? 1 : 0,
      risques: content.type === "risque" ? 1 : 0,
      permis: content.type === "permis" ? 1 : 0,
      annonces: content.type === "annonce" ? 1 : 0,
      vacance: 0,
      social: 0,
      attractivite: 0,
    });
    setRightPanelOpen(true);

    // Fetch complementary data in background
    try {
      const [risquesRes, lovacRes, socialRes, inseeRes] = await Promise.all([
        fetch(`/api/risques?commune=${encodeURIComponent(commune)}`).then(r => r.json()),
        fetch(`/api/lovac`).then(r => r.json()),
        fetch(`/api/social`).then(r => r.json()),
        fetch(`/api/insee`).then(r => r.json()),
      ]);

      // Filter lovac/social/insee for this commune
      const lovacData = (lovacRes.data || []).find(
        (d: { commune: string }) => d.commune === commune
      );
      const socialData = (socialRes.par_commune || []).find(
        (d: { commune: string }) => d.commune === commune
      );
      const inseeData = (inseeRes.data || []).find(
        (d: { commune: string }) => d.commune === commune
      );

      // Risques for this commune
      const risquesForCommune = (risquesRes.data || []).find(
        (d: { commune: string }) => d.commune === commune
      );

      const updatedFeature: SelectedFeature = {
        ...initialFeature,
        risquesData: risquesForCommune
          ? { commune, risques: risquesForCommune.risques, niveau_max: risquesForCommune.niveau_max }
          : initialFeature.risquesData,
        vacanceData: lovacData
          ? { commune, taux_vacance: lovacData.taux_vacance, nb_logements_vacants: lovacData.nb_logements_vacants, duree_vacance_moyenne: lovacData.duree_vacance_moyenne }
          : undefined,
        socialData: socialData
          ? { commune, total: socialData.total, bailleurs: socialData.bailleurs }
          : undefined,
        attractiviteData: inseeData
          ? { commune, population: inseeData.population, revenu_median: inseeData.revenu_median, taux_chomage: inseeData.taux_chomage, taux_pauvrete: inseeData.taux_pauvrete, part_proprietaires: inseeData.part_proprietaires }
          : undefined,
      };

      setSelectedFeature(updatedFeature);
      setTabCounts({
        transactions: content.type === "transaction" ? 1 : 0,
        risques: risquesForCommune ? risquesForCommune.risques?.length || 1 : 0,
        permis: content.type === "permis" ? 1 : 0,
        annonces: content.type === "annonce" ? 1 : 0,
        vacance: lovacData ? 1 : 0,
        social: socialData ? 1 : 0,
        attractivite: inseeData ? 1 : 0,
      });
    } catch {
      // Keep initial data on network error
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left sidebar — desktop only */}
      <LeftSidebar
        activeLayers={activeLayers}
        onToggleLayer={toggleLayer}
        currentZoom={viewState.zoom}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Map area */}
      <div className="flex-1 relative min-w-0">
        <MapContainer onMapInit={initializeMap} />

        {/* Data layers */}
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
            <CadastreLayer
              map={mapRef.current}
              isActive={isLayerActive("cadastre")}
            />
          </>
        )}

        {/* Floating search bar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-auto hidden sm:block">
          <SearchBar onSelect={handleSearchSelect} />
        </div>
        <div className="sm:hidden absolute top-3 left-14 right-3 z-10 pointer-events-auto">
          <SearchBar onSelect={handleSearchSelect} />
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
              <p className="text-sm text-gray-500">Chargement de la carte...</p>
            </div>
          </div>
        )}

        {/* Legends — bottom right, above zoom controls */}
        {isMapReady && (
          <div className="absolute bottom-24 right-3 z-10 pointer-events-auto space-y-2">
            <Legend isLayerActive={isLayerActive} />
          </div>
        )}

        {/* Attribution footer */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <div className="flex justify-end p-2">
            <div className="pointer-events-auto">
              <p className="text-[9px] text-gray-500 bg-white/70 px-1.5 py-0.5 rounded">
                Sources : DVF, INSEE, Géorisques, GPU, Cadastre Etalab | ©
                CarteImmoMartinique 2026
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: layer sheet */}
        <MobileLayerSheet
          activeLayers={activeLayers}
          onToggleLayer={toggleLayer}
          currentZoom={viewState.zoom}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Mobile: right panel as bottom sheet */}
        <RightPanelMobile
          isOpen={rightPanelOpen}
          onClose={handleClosePanel}
          feature={selectedFeature}
          tabCounts={tabCounts}
        />
      </div>

      {/* Right panel — desktop only */}
      <RightPanel
        isOpen={rightPanelOpen}
        onClose={handleClosePanel}
        feature={selectedFeature}
        tabCounts={tabCounts}
      />
    </div>
  );
}
