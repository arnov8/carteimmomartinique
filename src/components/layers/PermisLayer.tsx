"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { MapMouseEvent } from "maplibre-gl";
import type { SidebarContent } from "@/types";

interface PermisLayerProps {
  map: maplibregl.Map | null;
  isActive: boolean;
  onFeatureClick: (content: SidebarContent) => void;
}

const SOURCE_ID = "permis-source";
const POINTS_LAYER = "permis-points";
const LABELS_LAYER = "permis-labels";

export default function PermisLayer({
  map,
  isActive,
  onFeatureClick,
}: PermisLayerProps) {
  const loadedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (m: maplibregl.Map) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const bounds = m.getBounds();
    const params = new URLSearchParams({
      west: String(bounds.getWest()),
      south: String(bounds.getSouth()),
      east: String(bounds.getEast()),
      north: String(bounds.getNorth()),
      limit: "500",
    });

    try {
      const res = await fetch(`/api/permis?${params}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) return;
      const geojson = await res.json();

      const source = m.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
      if (source) source.setData(geojson);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
  }, []);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      if (!map) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [POINTS_LAYER],
      });
      if (features.length === 0) return;

      const props = features[0].properties;
      onFeatureClick({
        type: "permis",
        title: `Permis — ${props.commune}`,
        data: { ...props },
      });
    },
    [map, onFeatureClick]
  );

  // Init layers
  useEffect(() => {
    if (!map || loadedRef.current) return;

    const setup = () => {
      if (map.getSource(SOURCE_ID)) return;

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: POINTS_LAYER,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "nombre_logements"], 1],
            1, 5,
            10, 8,
            50, 14,
          ],
          "circle-color": [
            "match",
            ["get", "decision"],
            "accorde", "#22c55e",
            "refuse", "#ef4444",
            "en_cours", "#3b82f6",
            "#94a3b8",
          ],
          "circle-stroke-width": [
            "match",
            ["get", "nature_travaux"],
            "construction_neuve", 2,
            "demolition", 2,
            1.5,
          ],
          "circle-stroke-color": [
            "match",
            ["get", "nature_travaux"],
            "demolition", "#ef4444",
            "#ffffff",
          ],
          "circle-opacity": 0.8,
        },
      });

      map.addLayer({
        id: LABELS_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        minzoom: 14,
        layout: {
          "text-field": [
            "case",
            [">", ["coalesce", ["get", "nombre_logements"], 0], 1],
            [
              "concat",
              ["to-string", ["get", "nombre_logements"]],
              " log.",
            ],
            "",
          ],
          "text-size": 9,
          "text-offset": [0, -1.5],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#1e293b",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        },
      });

      loadedRef.current = true;

      map.on("mouseenter", POINTS_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", POINTS_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });

      fetchData(map);
      map.on("moveend", () => {
        if (map.getLayoutProperty(POINTS_LAYER, "visibility") !== "none") {
          fetchData(map);
        }
      });
    };

    if (map.isStyleLoaded()) setup();
    else map.on("load", setup);
  }, [map, fetchData]);

  // Toggle visibility
  useEffect(() => {
    if (!map || !loadedRef.current) return;
    const vis = isActive ? "visible" : "none";
    [POINTS_LAYER, LABELS_LAYER].forEach((id) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", vis);
    });
    if (isActive && map) fetchData(map);
  }, [map, isActive, fetchData]);

  // Click
  useEffect(() => {
    if (!map || !isActive) return;
    map.on("click", POINTS_LAYER, handleClick);
    return () => { map.off("click", POINTS_LAYER, handleClick); };
  }, [map, isActive, handleClick]);

  return null;
}
