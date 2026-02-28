"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Logo from "@/components/ui/Logo";
import DemoLeftSidebar from "@/components/demo/DemoLeftSidebar";
import type { LayerFilters } from "@/components/demo/DemoLeftSidebar";
import DemoRightPanel, { DemoRightPanelMobile } from "@/components/demo/DemoRightPanel";
import type { SelectedFeature, TabCounts } from "@/components/demo/DemoRightPanel";
import DemoLegend from "@/components/demo/DemoLegend";
import DemoMobileLayerSheet from "@/components/demo/DemoMobileLayerSheet";
import {
  MARTINIQUE_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MAP_STYLE,
  ZOOM_HEATMAP_MAX,
  ZOOM_POINTS_MIN,
  ZOOM_CADASTRE_MIN,
} from "@/lib/constants";
import {
  getDemoTransactionsGeoJSON,
  getDemoPermisGeoJSON,
  getDemoAnnoncesGeoJSON,
  getDemoVacanceGeoJSON,
  getDemoSocialGeoJSON,
  getDemoAttractiviteGeoJSON,
  getDemoRisquesGeoJSON,
  DEMO_RISQUES,
  DEMO_VACANCE,
  DEMO_SOCIAL,
  DEMO_ATTRACTIVITE,
} from "@/lib/demo-data";
import type { LayerId } from "@/types";

// ── Layer IDs ─────────────────────────────────────────────────────────────

const LAYER_IDS = {
  dvf: { source: "demo-dvf", heatmap: "demo-dvf-heatmap", points: "demo-dvf-points", labels: "demo-dvf-labels" },
  risques: { source: "demo-risques", markers: "demo-risques-markers", labels: "demo-risques-labels" },
  permis: { source: "demo-permis", points: "demo-permis-points", labels: "demo-permis-labels" },
  annonces: { source: "demo-annonces", points: "demo-annonces-points", labels: "demo-annonces-labels" },
  vacance: { source: "demo-vacance", circles: "demo-vacance-circles", labels: "demo-vacance-labels" },
  social: { source: "demo-social", circles: "demo-social-circles", labels: "demo-social-labels" },
  attractivite: { source: "demo-attractivite", circles: "demo-attractivite-circles", labels: "demo-attractivite-labels" },
  cadastre: { source: "demo-cadastre", raster: "demo-cadastre-raster" },
} as const;

const CADASTRE_TILE_URL =
  "https://data.geopf.fr/wmts?" +
  "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0" +
  "&LAYER=CADASTRALPARCELS.PARCELLAIRE_EXPRESS" +
  "&STYLE=PCI%20vecteur" +
  "&TILEMATRIXSET=PM" +
  "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
  "&FORMAT=image/png";

// ── Helper: toggle layers ────────────────────────────────────────────────

function setLayerVisibility(map: maplibregl.Map, layerIds: string[], visible: boolean) {
  const vis = visible ? "visible" : "none";
  for (const id of layerIds) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", vis);
    }
  }
}

// ── Default state ────────────────────────────────────────────────────────

const DEFAULT_FILTERS: LayerFilters = {
  dvf: { priceMin: 0, priceMax: 10000, types: [] },
  annonces: { types: [] },
  permis: { decisions: [] },
};

// ── Page ──────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Layer visibility
  const [activeLayers, setActiveLayers] = useState<Set<LayerId>>(new Set(["dvf"]));
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);

  // Filters
  const [filters, setFilters] = useState<LayerFilters>(DEFAULT_FILTERS);

  // Right panel
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

  // ── Layer toggle ──────────────────────────────────────────────────────

  const toggleLayer = useCallback((id: LayerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isLayerActive = useCallback(
    (id: LayerId) => activeLayers.has(id),
    [activeLayers]
  );

  // ── Close right panel ─────────────────────────────────────────────────

  const closeRightPanel = useCallback(() => {
    setRightPanelOpen(false);
    setSelectedFeature(null);
  }, []);

  // ── Unified feature select → aggregates data for all tabs ─────────────

  const handleFeatureSelect = useCallback(
    (commune: string, clickedData: Record<string, unknown>, clickedType: string, address?: string) => {
      // Collect all data for this commune
      const dvfGeo = getDemoTransactionsGeoJSON();
      const communeTransactions = dvfGeo.features.filter(
        (f) => f.properties.commune === commune
      );

      const communeRisques = DEMO_RISQUES.filter((r) => r.commune === commune);
      const permisGeo = getDemoPermisGeoJSON();
      const communePermis = permisGeo.features.filter(
        (f) => f.properties.commune === commune
      );

      const annoncesGeo = getDemoAnnoncesGeoJSON();
      const communeAnnonces = annoncesGeo.features.filter(
        (f) => f.properties.commune === commune
      );

      const communeVacance = DEMO_VACANCE.find((v) => v.commune === commune);
      const communeSocial = DEMO_SOCIAL.find((s) => s.commune === commune);
      const communeAttract = DEMO_ATTRACTIVITE.find((a) => a.commune === commune);

      // Compute tab counts
      const counts: TabCounts = {
        transactions: communeTransactions.length,
        risques: communeRisques.length,
        permis: communePermis.length,
        annonces: communeAnnonces.length,
        vacance: communeVacance ? 1 : 0,
        social: communeSocial ? 1 : 0,
        attractivite: communeAttract ? 1 : 0,
      };

      // Build per-tab data (shaped to match panel props)
      const feature: SelectedFeature = {
        commune,
        address,
        clickedType,
        clickedData,
      };

      // Transaction — use the clicked data directly if it's a DVF click
      if (clickedType === "transaction") {
        feature.transactionData = { ...clickedData };
      } else if (communeTransactions.length > 0) {
        feature.transactionData = { ...communeTransactions[0].properties };
      }

      // Risques
      if (communeRisques.length > 0) {
        const niveaux = communeRisques.map((r) => r.niveau);
        const niveauOrder = ["tres_fort", "fort", "moyen", "faible"];
        const niveauMax = niveauOrder.find((n) => niveaux.includes(n)) || "faible";
        feature.risquesData = {
          commune,
          niveau_max: niveauMax,
          nb_risques: communeRisques.length,
          risques: JSON.stringify(communeRisques),
        };
      }

      // Permis
      if (clickedType === "permis") {
        feature.permisData = { ...clickedData };
      } else if (communePermis.length > 0) {
        feature.permisData = { ...communePermis[0].properties };
      }

      // Annonces
      if (clickedType === "annonce") {
        feature.annonceData = { ...clickedData };
      } else if (communeAnnonces.length > 0) {
        feature.annonceData = { ...communeAnnonces[0].properties };
      }

      // Vacance
      if (communeVacance) {
        feature.vacanceData = {
          commune,
          nb_logements_vacants: communeVacance.nb_logements_vacants,
          taux_vacance: communeVacance.taux_vacance,
          duree_vacance_moyenne: null,
          annee: 2024,
        };
      }

      // Social
      if (communeSocial) {
        feature.socialData = {
          commune,
          total: communeSocial.total,
          bailleurs: JSON.stringify(communeSocial.bailleurs),
        };
      }

      // Attractivité
      if (communeAttract) {
        feature.attractiviteData = {
          commune,
          score: communeAttract.score,
          details: JSON.stringify({
            demographie: communeAttract.demographie,
            economie: communeAttract.economie,
            immobilier: communeAttract.immobilier,
            cadre_vie: communeAttract.cadre_vie,
          }),
        };
      }

      setTabCounts(counts);
      setSelectedFeature(feature);
      setRightPanelOpen(true);
    },
    []
  );

  // ── Initialize map + all demo layers ─────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [MARTINIQUE_CENTER.lng, MARTINIQUE_CENTER.lat],
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: [[-62.0, 14.2], [-60.5, 15.1]],
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(new maplibregl.ScaleControl(), "bottom-left");

    mapRef.current = map;

    // Track zoom
    map.on("zoom", () => {
      setCurrentZoom(Math.round(map.getZoom() * 100) / 100);
    });

    map.on("load", () => {
      addAllDemoLayers(map);
      setIsMapReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add all demo layers (called once on map load) ────────────────────

  function addAllDemoLayers(map: maplibregl.Map) {
    // ─── DVF ───
    const dvfGeoJSON = getDemoTransactionsGeoJSON();
    map.addSource(LAYER_IDS.dvf.source, { type: "geojson", data: dvfGeoJSON });

    map.addLayer({
      id: LAYER_IDS.dvf.heatmap,
      type: "heatmap",
      source: LAYER_IDS.dvf.source,
      maxzoom: ZOOM_HEATMAP_MAX + 1,
      paint: {
        "heatmap-weight": ["interpolate", ["linear"], ["coalesce", ["get", "prix_m2"], 0], 0, 0, 1000, 0.3, 2000, 0.5, 3000, 0.8, 5000, 1],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 9, 0.5, 12, 1.5],
        "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0,0,0,0)", 0.1, "rgba(34,197,94,0.4)", 0.3, "rgba(132,204,22,0.5)", 0.5, "rgba(234,179,8,0.6)", 0.7, "rgba(249,115,22,0.7)", 0.9, "rgba(239,68,68,0.8)", 1, "rgba(220,38,38,0.9)"],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 9, 15, 12, 30],
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0.8, 13, 0],
      },
    });

    map.addLayer({
      id: LAYER_IDS.dvf.points,
      type: "circle",
      source: LAYER_IDS.dvf.source,
      minzoom: ZOOM_POINTS_MIN - 1,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 3, 14, 6, 16, 10],
        "circle-color": ["interpolate", ["linear"], ["coalesce", ["get", "prix_m2"], 0], 0, "#94a3b8", 1000, "#22c55e", 1500, "#84cc16", 2000, "#eab308", 2500, "#f97316", 3000, "#ef4444", 4000, "#dc2626"],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 13, 0.85],
      },
    });

    map.addLayer({
      id: LAYER_IDS.dvf.labels,
      type: "symbol",
      source: LAYER_IDS.dvf.source,
      minzoom: 15,
      layout: {
        "text-field": ["concat", ["number-format", ["coalesce", ["get", "prix_m2"], 0], { "max-fraction-digits": 0 }], "\u20AC"],
        "text-size": 10,
        "text-offset": [0, -1.5],
        "text-allow-overlap": false,
      },
      paint: { "text-color": "#1e293b", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
    });

    // ─── Risques ───
    map.addSource(LAYER_IDS.risques.source, { type: "geojson", data: getDemoRisquesGeoJSON() });

    map.addLayer({
      id: LAYER_IDS.risques.markers,
      type: "circle",
      source: LAYER_IDS.risques.source,
      layout: { visibility: "none" },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 12, 12, 20, 14, 8],
        "circle-color": ["get", "color"],
        "circle-opacity": 0.6,
        "circle-stroke-width": 2,
        "circle-stroke-color": ["get", "color"],
        "circle-stroke-opacity": 0.9,
      },
    });

    map.addLayer({
      id: LAYER_IDS.risques.labels,
      type: "symbol",
      source: LAYER_IDS.risques.source,
      layout: {
        visibility: "none",
        "text-field": ["get", "nb_risques"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 8, 12, 11],
        "text-allow-overlap": true,
      },
      paint: { "text-color": "#ffffff", "text-halo-color": "rgba(0,0,0,0.5)", "text-halo-width": 1 },
    });

    // ─── Permis ───
    map.addSource(LAYER_IDS.permis.source, { type: "geojson", data: getDemoPermisGeoJSON() });

    map.addLayer({
      id: LAYER_IDS.permis.points,
      type: "circle",
      source: LAYER_IDS.permis.source,
      layout: { visibility: "none" },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["coalesce", ["get", "nombre_logements"], 1], 1, 5, 10, 8, 50, 14],
        "circle-color": ["match", ["get", "decision"], "accorde", "#22c55e", "refuse", "#ef4444", "en_cours", "#3b82f6", "#94a3b8"],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.8,
      },
    });

    map.addLayer({
      id: LAYER_IDS.permis.labels,
      type: "symbol",
      source: LAYER_IDS.permis.source,
      minzoom: 14,
      layout: {
        visibility: "none",
        "text-field": ["case", [">", ["coalesce", ["get", "nombre_logements"], 0], 1], ["concat", ["to-string", ["get", "nombre_logements"]], " log."], ""],
        "text-size": 9,
        "text-offset": [0, -1.5],
        "text-allow-overlap": false,
      },
      paint: { "text-color": "#1e293b", "text-halo-color": "#ffffff", "text-halo-width": 1 },
    });

    // ─── Annonces ───
    map.addSource(LAYER_IDS.annonces.source, { type: "geojson", data: getDemoAnnoncesGeoJSON() });

    map.addLayer({
      id: LAYER_IDS.annonces.points,
      type: "circle",
      source: LAYER_IDS.annonces.source,
      layout: { visibility: "none" },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 13, 8, 16, 12],
        "circle-color": ["match", ["get", "type_bien"], "maison", "#f97316", "appartement", "#3b82f6", "terrain", "#22c55e", "local_commercial", "#8b5cf6", "#94a3b8"],
        "circle-opacity": 0.8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    map.addLayer({
      id: LAYER_IDS.annonces.labels,
      type: "symbol",
      source: LAYER_IDS.annonces.source,
      minzoom: 14,
      layout: {
        visibility: "none",
        "text-field": ["get", "titre"],
        "text-size": 10,
        "text-offset": [0, -1.5],
        "text-allow-overlap": false,
      },
      paint: { "text-color": "#1f2937", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
    });

    // ─── Vacance ───
    map.addSource(LAYER_IDS.vacance.source, { type: "geojson", data: getDemoVacanceGeoJSON() });

    map.addLayer({
      id: LAYER_IDS.vacance.circles,
      type: "circle",
      source: LAYER_IDS.vacance.source,
      layout: { visibility: "none" },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["get", "taux_vacance"], 0, 8, 10, 14, 20, 22, 30, 30],
        "circle-color": ["interpolate", ["linear"], ["get", "taux_vacance"], 5, "#22c55e", 10, "#84cc16", 15, "#eab308", 20, "#f97316", 25, "#ef4444"],
        "circle-opacity": 0.55,
        "circle-stroke-width": 2,
        "circle-stroke-color": ["interpolate", ["linear"], ["get", "taux_vacance"], 5, "#22c55e", 10, "#84cc16", 15, "#eab308", 20, "#f97316", 25, "#ef4444"],
        "circle-stroke-opacity": 0.85,
      },
    });

    map.addLayer({
      id: LAYER_IDS.vacance.labels,
      type: "symbol",
      source: LAYER_IDS.vacance.source,
      layout: {
        visibility: "none",
        "text-field": ["concat", ["to-string", ["get", "taux_vacance"]], "%"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 8, 12, 11],
        "text-allow-overlap": true,
      },
      paint: { "text-color": "#ffffff", "text-halo-color": "rgba(0,0,0,0.5)", "text-halo-width": 1 },
    });

    // ─── Social ───
    map.addSource(LAYER_IDS.social.source, { type: "geojson", data: getDemoSocialGeoJSON() });

    map.addLayer({
      id: LAYER_IDS.social.circles,
      type: "circle",
      source: LAYER_IDS.social.source,
      layout: { visibility: "none" },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["get", "total"], 0, 6, 500, 12, 2000, 20, 5000, 30],
        "circle-color": "#8b5cf6",
        "circle-opacity": 0.5,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#7c3aed",
        "circle-stroke-opacity": 0.8,
      },
    });

    map.addLayer({
      id: LAYER_IDS.social.labels,
      type: "symbol",
      source: LAYER_IDS.social.source,
      layout: {
        visibility: "none",
        "text-field": ["to-string", ["get", "total"]],
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 8, 12, 11],
        "text-allow-overlap": true,
      },
      paint: { "text-color": "#ffffff", "text-halo-color": "rgba(0,0,0,0.5)", "text-halo-width": 1 },
    });

    // ─── Attractivité ───
    map.addSource(LAYER_IDS.attractivite.source, { type: "geojson", data: getDemoAttractiviteGeoJSON() });

    map.addLayer({
      id: LAYER_IDS.attractivite.circles,
      type: "circle",
      source: LAYER_IDS.attractivite.source,
      layout: { visibility: "none" },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 14, 12, 22, 14, 10],
        "circle-color": ["interpolate", ["linear"], ["get", "score"], 35, "#ef4444", 50, "#f97316", 60, "#eab308", 75, "#84cc16", 85, "#22c55e"],
        "circle-opacity": 0.6,
        "circle-stroke-width": 2.5,
        "circle-stroke-color": ["interpolate", ["linear"], ["get", "score"], 35, "#ef4444", 50, "#f97316", 60, "#eab308", 75, "#84cc16", 85, "#22c55e"],
        "circle-stroke-opacity": 0.9,
      },
    });

    map.addLayer({
      id: LAYER_IDS.attractivite.labels,
      type: "symbol",
      source: LAYER_IDS.attractivite.source,
      layout: {
        visibility: "none",
        "text-field": ["to-string", ["get", "score"]],
        "text-size": ["interpolate", ["linear"], ["zoom"], 9, 9, 12, 12],
        "text-allow-overlap": true,
      },
      paint: { "text-color": "#ffffff", "text-halo-color": "rgba(0,0,0,0.6)", "text-halo-width": 1.2 },
    });

    // ─── Cadastre (tuiles raster IGN) ───
    map.addSource(LAYER_IDS.cadastre.source, {
      type: "raster",
      tiles: [CADASTRE_TILE_URL],
      tileSize: 256,
      minzoom: ZOOM_CADASTRE_MIN,
      maxzoom: 20,
    });

    map.addLayer({
      id: LAYER_IDS.cadastre.raster,
      type: "raster",
      source: LAYER_IDS.cadastre.source,
      minzoom: ZOOM_CADASTRE_MIN,
      layout: { visibility: "none" },
      paint: { "raster-opacity": 0.7 },
    });

    // ─── Click handlers ───
    setupClickHandlers(map);

    // ─── Cursor ───
    const clickableLayers = [
      LAYER_IDS.dvf.points,
      LAYER_IDS.risques.markers,
      LAYER_IDS.permis.points,
      LAYER_IDS.annonces.points,
      LAYER_IDS.vacance.circles,
      LAYER_IDS.social.circles,
      LAYER_IDS.attractivite.circles,
    ];
    for (const layerId of clickableLayers) {
      map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; });
    }
  }

  // ── Click handlers → unified handleFeatureSelect ─────────────────────

  function setupClickHandlers(map: maplibregl.Map) {
    // DVF
    map.on("click", LAYER_IDS.dvf.points, (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.dvf.points] });
      if (f.length === 0) return;
      const p = f[0].properties;
      handleFeatureSelect(
        p.commune as string,
        { ...p },
        "transaction",
        p.adresse as string | undefined
      );
    });

    // Risques
    map.on("click", LAYER_IDS.risques.markers, (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.risques.markers] });
      if (f.length === 0) return;
      const p = f[0].properties;
      handleFeatureSelect(p.commune as string, { ...p }, "risque");
    });

    // Permis
    map.on("click", LAYER_IDS.permis.points, (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.permis.points] });
      if (f.length === 0) return;
      const p = f[0].properties;
      handleFeatureSelect(
        p.commune as string,
        { ...p },
        "permis",
        p.adresse as string | undefined
      );
    });

    // Annonces
    map.on("click", LAYER_IDS.annonces.points, (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.annonces.points] });
      if (f.length === 0) return;
      const p = f[0].properties;
      handleFeatureSelect(
        p.commune as string,
        { ...p },
        "annonce",
        p.titre as string | undefined
      );
    });

    // Vacance
    map.on("click", LAYER_IDS.vacance.circles, (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.vacance.circles] });
      if (f.length === 0) return;
      const p = f[0].properties;
      handleFeatureSelect(p.commune as string, { ...p }, "vacance");
    });

    // Social
    map.on("click", LAYER_IDS.social.circles, (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.social.circles] });
      if (f.length === 0) return;
      const p = f[0].properties;
      handleFeatureSelect(p.commune as string, { ...p }, "social");
    });

    // Attractivité
    map.on("click", LAYER_IDS.attractivite.circles, (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: [LAYER_IDS.attractivite.circles] });
      if (f.length === 0) return;
      const p = f[0].properties;
      handleFeatureSelect(p.commune as string, { ...p }, "attractivite");
    });
  }

  // ── Sync layer visibility when activeLayers changes ──────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    setLayerVisibility(map, [LAYER_IDS.dvf.heatmap, LAYER_IDS.dvf.points, LAYER_IDS.dvf.labels], isLayerActive("dvf"));
    setLayerVisibility(map, [LAYER_IDS.risques.markers, LAYER_IDS.risques.labels], isLayerActive("risques"));
    setLayerVisibility(map, [LAYER_IDS.permis.points, LAYER_IDS.permis.labels], isLayerActive("permis"));
    setLayerVisibility(map, [LAYER_IDS.annonces.points, LAYER_IDS.annonces.labels], isLayerActive("annonces"));
    setLayerVisibility(map, [LAYER_IDS.vacance.circles, LAYER_IDS.vacance.labels], isLayerActive("vacance"));
    setLayerVisibility(map, [LAYER_IDS.social.circles, LAYER_IDS.social.labels], isLayerActive("social"));
    setLayerVisibility(map, [LAYER_IDS.attractivite.circles, LAYER_IDS.attractivite.labels], isLayerActive("attractivite"));
    setLayerVisibility(map, [LAYER_IDS.cadastre.raster], isLayerActive("cadastre"));
  }, [activeLayers, isMapReady, isLayerActive]);

  // ── Resize map when right panel opens/closes ─────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    // Small delay to let the DOM update
    const t = setTimeout(() => map.resize(), 50);
    return () => clearTimeout(t);
  }, [rightPanelOpen, isMapReady]);

  // ── Apply filters to GeoJSON sources ─────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    // DVF filters
    const dvfSource = map.getSource(LAYER_IDS.dvf.source) as maplibregl.GeoJSONSource | undefined;
    if (dvfSource) {
      const allDvf = getDemoTransactionsGeoJSON();
      const filtered = {
        ...allDvf,
        features: allDvf.features.filter((f) => {
          const p = f.properties;
          if (filters.dvf.priceMin > 0 && (p.prix_m2 as number) < filters.dvf.priceMin) return false;
          if (filters.dvf.priceMax < 10000 && (p.prix_m2 as number) > filters.dvf.priceMax) return false;
          if (filters.dvf.types.length > 0 && !filters.dvf.types.includes(p.type_local as string)) return false;
          return true;
        }),
      };
      dvfSource.setData(filtered as GeoJSON.GeoJSON);
    }

    // Annonces filters
    const annonceSource = map.getSource(LAYER_IDS.annonces.source) as maplibregl.GeoJSONSource | undefined;
    if (annonceSource) {
      const allAnnonces = getDemoAnnoncesGeoJSON();
      const filtered = {
        ...allAnnonces,
        features: allAnnonces.features.filter((f) => {
          const p = f.properties;
          if (filters.annonces.types.length > 0 && !filters.annonces.types.includes(p.type_bien as string)) return false;
          return true;
        }),
      };
      annonceSource.setData(filtered as GeoJSON.GeoJSON);
    }

    // Permis filters
    const permisSource = map.getSource(LAYER_IDS.permis.source) as maplibregl.GeoJSONSource | undefined;
    if (permisSource) {
      const allPermis = getDemoPermisGeoJSON();
      const filtered = {
        ...allPermis,
        features: allPermis.features.filter((f) => {
          const p = f.properties;
          if (filters.permis.decisions.length > 0 && !filters.permis.decisions.includes(p.decision as string)) return false;
          return true;
        }),
      };
      permisSource.setData(filtered as GeoJSON.GeoJSON);
    }
  }, [filters, isMapReady]);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── Left Sidebar (desktop) ── */}
      <DemoLeftSidebar
        activeLayers={activeLayers}
        onToggleLayer={toggleLayer}
        currentZoom={currentZoom}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* ── Mobile layer sheet ── */}
      <DemoMobileLayerSheet
        activeLayers={activeLayers}
        onToggleLayer={toggleLayer}
        currentZoom={currentZoom}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* ── Map (center, flex-1) ── */}
      <div className="relative flex-1 h-full min-w-0">
        {/* Map container */}
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />

        {/* Floating logo (mobile only, when sheet is not over it) */}
        <div className="hidden md:block absolute top-3 left-3 z-10">
          {/* Logo is in the left sidebar on desktop */}
        </div>

        {/* Demo badge */}
        <div className="absolute top-3 right-3 z-10 md:top-3 md:right-3">
          <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border border-amber-200">
            DÉMO
          </div>
        </div>

        {/* Legends (bottom-right, above zoom controls) */}
        {isMapReady && (
          <div className="absolute bottom-24 right-3 z-10 space-y-2">
            <DemoLegend isLayerActive={isLayerActive} />
          </div>
        )}

        {/* Loading */}
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

        {/* Attribution */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <div className="flex justify-center p-2">
            <p className="pointer-events-auto text-[9px] text-gray-500 bg-white/70 px-1.5 py-0.5 rounded">
              Mode Démo — Données fictives | CarteImmoMartinique 2026
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel (desktop) ── */}
      <DemoRightPanel
        isOpen={rightPanelOpen}
        onClose={closeRightPanel}
        feature={selectedFeature}
        tabCounts={tabCounts}
      />

      {/* ── Right Panel (mobile — bottom sheet) ── */}
      <DemoRightPanelMobile
        isOpen={rightPanelOpen}
        onClose={closeRightPanel}
        feature={selectedFeature}
        tabCounts={tabCounts}
      />
    </div>
  );
}
