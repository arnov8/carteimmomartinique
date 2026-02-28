"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import type { MapMouseEvent } from "maplibre-gl";
import type { SidebarContent } from "@/types";

interface SocialLayerProps {
  map: maplibregl.Map | null;
  isActive: boolean;
  onFeatureClick: (content: SidebarContent) => void;
}

const SOURCE_ID = "social-source";
const CIRCLES_LAYER = "social-circles";
const LABELS_LAYER = "social-labels";

const COMMUNE_POSITIONS: Record<string, [number, number]> = {
  "Fort-de-France": [-61.0588, 14.6065],
  "Le Lamentin": [-60.9613, 14.6133],
  "Schœlcher": [-61.0900, 14.6270],
  "Le Robert": [-60.9360, 14.6700],
  "Le François": [-60.9020, 14.6137],
  "Ducos": [-60.9720, 14.5800],
  "Sainte-Marie": [-60.9950, 14.7750],
  "Sainte-Luce": [-60.9290, 14.4820],
  "Les Trois-Îlets": [-61.0400, 14.5330],
  "Le Marin": [-60.8720, 14.4680],
  "Rivière-Salée": [-61.0050, 14.5350],
  "Saint-Joseph": [-61.0430, 14.6650],
  "Le Vauclin": [-60.8380, 14.5460],
  "Sainte-Anne": [-60.8750, 14.4390],
  "Rivière-Pilote": [-60.9050, 14.4680],
  "Gros-Morne": [-61.0200, 14.7200],
  "Saint-Esprit": [-60.9370, 14.5430],
  "La Trinité": [-60.9650, 14.7400],
  "Le Lorrain": [-61.0700, 14.8300],
  "Saint-Pierre": [-61.1770, 14.7490],
  "Le Morne-Rouge": [-61.1300, 14.7600],
  "Le Carbet": [-61.1830, 14.7150],
  "Case-Pilote": [-61.1450, 14.6500],
  "Bellefontaine": [-61.1550, 14.6730],
  "Le Prêcheur": [-61.2200, 14.8050],
  "Grand'Rivière": [-61.1800, 14.8700],
  "Macouba": [-61.1370, 14.8750],
  "Basse-Pointe": [-61.1130, 14.8700],
  "L'Ajoupa-Bouillon": [-61.1130, 14.8200],
  "Fonds-Saint-Denis": [-61.0950, 14.7200],
  "Le Morne-Vert": [-61.1150, 14.7050],
  "Le Diamant": [-61.0300, 14.4760],
  "Les Anses-d'Arlet": [-61.0820, 14.4940],
  "Le Marigot": [-61.0200, 14.7900],
};

interface CommuneSocial {
  code_commune: string;
  commune: string;
  total: number;
  bailleurs: Array<{ nom: string; nb: number }>;
}

export default function SocialLayer({
  map,
  isActive,
  onFeatureClick,
}: SocialLayerProps) {
  const loadedRef = useRef(false);
  const [data, setData] = useState<CommuneSocial[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/social");
      if (!res.ok) return;
      const json = await res.json();
      setData(json.par_commune || []);
    } catch (e) {
      console.error("Social fetch error:", e);
    }
  }, []);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      if (!map) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [CIRCLES_LAYER],
      });
      if (features.length === 0) return;

      const props = features[0].properties;
      const commune = props.commune;
      const communeData = data.find((d) => d.commune === commune);
      if (!communeData) return;

      onFeatureClick({
        type: "analyse",
        title: `Parc social — ${commune}`,
        data: {
          panel: "social",
          commune,
          total: communeData.total,
          bailleurs: JSON.stringify(communeData.bailleurs),
        },
      });
    },
    [map, data, onFeatureClick]
  );

  useEffect(() => {
    if (isActive && data.length === 0) {
      fetchData();
    }
  }, [isActive, data.length, fetchData]);

  useEffect(() => {
    if (!map || loadedRef.current || data.length === 0) return;

    const setup = () => {
      if (map.getSource(SOURCE_ID)) return;

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: buildGeoJSON(),
      });

      map.addLayer({
        id: CIRCLES_LAYER,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "total"],
            0, 6,
            500, 12,
            2000, 20,
            5000, 30,
          ],
          "circle-color": "#8b5cf6",
          "circle-opacity": 0.5,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#7c3aed",
          "circle-stroke-opacity": 0.8,
        },
      });

      map.addLayer({
        id: LABELS_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        layout: {
          "text-field": ["get", "label"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 9, 8, 12, 11],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.5)",
          "text-halo-width": 1,
        },
      });

      loadedRef.current = true;

      map.on("mouseenter", CIRCLES_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CIRCLES_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });
    };

    if (map.isStyleLoaded()) {
      setup();
    } else {
      map.on("load", setup);
    }
  }, [map, data]);

  useEffect(() => {
    if (!map || !loadedRef.current || data.length === 0) return;
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(buildGeoJSON());
    }
  }, [map, data]);

  function buildGeoJSON() {
    return {
      type: "FeatureCollection" as const,
      features: data
        .filter((d) => COMMUNE_POSITIONS[d.commune])
        .map((d) => {
          const pos = COMMUNE_POSITIONS[d.commune];
          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: pos,
            },
            properties: {
              commune: d.commune,
              total: d.total,
              label: `${d.total}`,
            },
          };
        }),
    };
  }

  useEffect(() => {
    if (!map || !loadedRef.current) return;
    const vis = isActive ? "visible" : "none";
    [CIRCLES_LAYER, LABELS_LAYER].forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", vis);
      }
    });
  }, [map, isActive]);

  useEffect(() => {
    if (!map || !isActive) return;
    map.on("click", CIRCLES_LAYER, handleClick);
    return () => {
      map.off("click", CIRCLES_LAYER, handleClick);
    };
  }, [map, isActive, handleClick]);

  return null;
}
