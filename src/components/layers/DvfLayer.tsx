"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { MapMouseEvent } from "maplibre-gl";
import { ZOOM_HEATMAP_MAX, ZOOM_POINTS_MIN } from "@/lib/constants";
import type { SidebarContent } from "@/types";

interface DvfLayerProps {
  map: maplibregl.Map | null;
  isActive: boolean;
  onFeatureClick: (content: SidebarContent) => void;
}

const SOURCE_ID = "dvf-source";
const HEATMAP_LAYER = "dvf-heatmap";
const POINTS_LAYER = "dvf-points";
const LABELS_LAYER = "dvf-labels";

export default function DvfLayer({
  map,
  isActive,
  onFeatureClick,
}: DvfLayerProps) {
  const loadedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (m: maplibregl.Map) => {
      // Cancel previous request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const bounds = m.getBounds();
      const params = new URLSearchParams({
        west: String(bounds.getWest()),
        south: String(bounds.getSouth()),
        east: String(bounds.getEast()),
        north: String(bounds.getNorth()),
        limit: "2000",
      });

      try {
        const res = await fetch(`/api/dvf?${params}`, {
          signal: abortRef.current.signal,
        });
        if (!res.ok) return;
        const geojson = await res.json();

        const source = m.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
        if (source) {
          source.setData(geojson);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("DVF fetch error:", e);
      }
    },
    []
  );

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      if (!map) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [POINTS_LAYER],
      });
      if (features.length === 0) return;

      const f = features[0];
      const props = f.properties;

      onFeatureClick({
        type: "transaction",
        title: `${props.type_local || "Bien"} — ${props.commune}`,
        data: {
          id: props.id,
          date_mutation: props.date_mutation,
          nature_mutation: props.nature_mutation,
          valeur_fonciere: props.valeur_fonciere,
          adresse: props.adresse,
          code_postal: props.code_postal,
          commune: props.commune,
          type_local: props.type_local,
          surface_reelle_bati: props.surface_reelle_bati,
          nombre_pieces: props.nombre_pieces,
          surface_terrain: props.surface_terrain,
          prix_m2: props.prix_m2,
        },
      });
    },
    [map, onFeatureClick]
  );

  // Init layers
  useEffect(() => {
    if (!map || loadedRef.current) return;

    const setup = () => {
      if (map.getSource(SOURCE_ID)) return;

      // Add empty source
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Heatmap layer (zoom 9-12)
      map.addLayer({
        id: HEATMAP_LAYER,
        type: "heatmap",
        source: SOURCE_ID,
        maxzoom: ZOOM_HEATMAP_MAX + 1,
        paint: {
          // Poids par prix au m²
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "prix_m2"], 0],
            0, 0,
            1000, 0.3,
            2000, 0.5,
            3000, 0.8,
            5000, 1,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9, 0.5,
            12, 1.5,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.1, "rgba(34,197,94,0.4)",
            0.3, "rgba(132,204,22,0.5)",
            0.5, "rgba(234,179,8,0.6)",
            0.7, "rgba(249,115,22,0.7)",
            0.9, "rgba(239,68,68,0.8)",
            1, "rgba(220,38,38,0.9)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9, 15,
            12, 30,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11, 0.8,
            13, 0,
          ],
        },
      });

      // Points layer (zoom 13+)
      map.addLayer({
        id: POINTS_LAYER,
        type: "circle",
        source: SOURCE_ID,
        minzoom: ZOOM_POINTS_MIN - 1,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12, 3,
            14, 6,
            16, 10,
          ],
          "circle-color": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "prix_m2"], 0],
            0, "#94a3b8",
            1000, "#22c55e",
            1500, "#84cc16",
            2000, "#eab308",
            2500, "#f97316",
            3000, "#ef4444",
            4000, "#dc2626",
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12, 0,
            13, 0.85,
          ],
        },
      });

      // Labels layer (zoom 15+)
      map.addLayer({
        id: LABELS_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        minzoom: 15,
        layout: {
          "text-field": [
            "concat",
            [
              "number-format",
              ["coalesce", ["get", "prix_m2"], 0],
              { "max-fraction-digits": 0 },
            ],
            "€",
          ],
          "text-size": 10,
          "text-offset": [0, -1.5],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#1e293b",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      loadedRef.current = true;

      // Cursor change
      map.on("mouseenter", POINTS_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", POINTS_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });

      // Fetch initial data
      fetchData(map);

      // Refetch on moveend
      map.on("moveend", () => {
        if (
          map.getLayoutProperty(POINTS_LAYER, "visibility") !== "none" ||
          map.getLayoutProperty(HEATMAP_LAYER, "visibility") !== "none"
        ) {
          fetchData(map);
        }
      });
    };

    if (map.isStyleLoaded()) {
      setup();
    } else {
      map.on("load", setup);
    }
  }, [map, fetchData]);

  // Toggle visibility
  useEffect(() => {
    if (!map || !loadedRef.current) return;

    const vis = isActive ? "visible" : "none";

    [HEATMAP_LAYER, POINTS_LAYER, LABELS_LAYER].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", vis);
      }
    });

    if (isActive && map) {
      fetchData(map);
    }
  }, [map, isActive, fetchData]);

  // Click handler
  useEffect(() => {
    if (!map || !isActive) return;

    map.on("click", POINTS_LAYER, handleClick);
    return () => {
      map.off("click", POINTS_LAYER, handleClick);
    };
  }, [map, isActive, handleClick]);

  return null; // Composant sans rendu — tout passe par MapLibre
}
