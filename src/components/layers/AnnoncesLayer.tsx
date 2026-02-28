"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import type { MapMouseEvent } from "maplibre-gl";
import type { SidebarContent, BoundingBox } from "@/types";

interface AnnoncesLayerProps {
  map: maplibregl.Map | null;
  isActive: boolean;
  onFeatureClick: (content: SidebarContent) => void;
}

const SOURCE_ID = "annonces-source";
const POINTS_LAYER = "annonces-points";
const LABELS_LAYER = "annonces-labels";

const TYPE_COLORS: Record<string, string> = {
  maison: "#f97316",
  appartement: "#3b82f6",
  terrain: "#22c55e",
  local_commercial: "#8b5cf6",
};

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M€`;
  if (price >= 1_000) return `${Math.round(price / 1_000)}k€`;
  return `${price}€`;
}

export default function AnnoncesLayer({
  map,
  isActive,
  onFeatureClick,
}: AnnoncesLayerProps) {
  const loadedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (bounds: BoundingBox) => {
      if (!map) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const url = `/api/annonces?north=${bounds.north}&south=${bounds.south}&east=${bounds.east}&west=${bounds.west}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const geojson = await res.json();

        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
        if (source) {
          source.setData(geojson);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("Annonces fetch error:", e);
      }
    },
    [map]
  );

  const getBounds = useCallback((): BoundingBox | null => {
    if (!map) return null;
    const b = map.getBounds();
    return {
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    };
  }, [map]);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      if (!map) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [POINTS_LAYER],
      });
      if (features.length === 0) return;

      const props = features[0].properties;
      onFeatureClick({
        type: "annonce",
        title: props.titre || "Annonce",
        data: {
          ...props,
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
            ["zoom"],
            10, 5,
            13, 8,
            16, 12,
          ],
          "circle-color": [
            "match",
            ["get", "type_bien"],
            "maison", TYPE_COLORS.maison,
            "appartement", TYPE_COLORS.appartement,
            "terrain", TYPE_COLORS.terrain,
            "local_commercial", TYPE_COLORS.local_commercial,
            "#94a3b8",
          ],
          "circle-opacity": 0.8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: LABELS_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        minzoom: 14,
        layout: {
          "text-field": [
            "concat",
            ["get", "prix_label"],
          ],
          "text-size": 10,
          "text-offset": [0, -1.5],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#1f2937",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      loadedRef.current = true;

      map.on("mouseenter", POINTS_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", POINTS_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });
    };

    if (map.isStyleLoaded()) {
      setup();
    } else {
      map.on("load", setup);
    }
  }, [map]);

  // Fetch on move
  useEffect(() => {
    if (!map || !isActive) return;

    const onMoveEnd = () => {
      const bounds = getBounds();
      if (bounds) fetchData(bounds);
    };

    onMoveEnd();
    map.on("moveend", onMoveEnd);
    return () => {
      map.off("moveend", onMoveEnd);
    };
  }, [map, isActive, fetchData, getBounds]);

  // Toggle visibility
  useEffect(() => {
    if (!map || !loadedRef.current) return;
    const vis = isActive ? "visible" : "none";
    [POINTS_LAYER, LABELS_LAYER].forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", vis);
      }
    });
  }, [map, isActive]);

  // Click handler
  useEffect(() => {
    if (!map || !isActive) return;
    map.on("click", POINTS_LAYER, handleClick);
    return () => {
      map.off("click", POINTS_LAYER, handleClick);
    };
  }, [map, isActive, handleClick]);

  return null;
}
