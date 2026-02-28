"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import type { MapMouseEvent } from "maplibre-gl";
import { LAYER_COLORS } from "@/lib/constants";
import type { SidebarContent } from "@/types";

interface RisquesLayerProps {
  map: maplibregl.Map | null;
  isActive: boolean;
  onFeatureClick: (content: SidebarContent) => void;
}

const SOURCE_ID = "risques-source";
const MARKERS_LAYER = "risques-markers";
const LABELS_LAYER = "risques-labels";

// Position approximative des communes de Martinique
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

const NIVEAU_COLORS: Record<string, string> = {
  faible: "#22c55e",
  moyen: "#eab308",
  fort: "#f97316",
  tres_fort: "#ef4444",
};

const NIVEAU_LABELS: Record<string, string> = {
  faible: "Faible",
  moyen: "Moyen",
  fort: "Fort",
  tres_fort: "Très fort",
};

const TYPE_ICONS: Record<string, string> = {
  sismique: "🔴",
  volcanique: "🌋",
  inondation: "🌊",
  submersion_marine: "🌊",
  mouvement_terrain: "⛰️",
};

interface CommuneRisques {
  commune: string;
  risques: Array<{
    type_risque: string;
    niveau: string;
    description: string;
    source: string;
  }>;
  niveau_max: string;
  nb_risques: number;
}

export default function RisquesLayer({
  map,
  isActive,
  onFeatureClick,
}: RisquesLayerProps) {
  const loadedRef = useRef(false);
  const [data, setData] = useState<CommuneRisques[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/risques");
      if (!res.ok) return;
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      console.error("Risques fetch error:", e);
    }
  }, []);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      if (!map) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: [MARKERS_LAYER],
      });
      if (features.length === 0) return;

      const props = features[0].properties;
      const commune = props.commune;

      // Retrouver les données complètes
      const communeData = data.find((d) => d.commune === commune);
      if (!communeData) return;

      onFeatureClick({
        type: "risque",
        title: `Risques — ${commune}`,
        data: {
          commune,
          risques: JSON.stringify(communeData.risques),
          niveau_max: communeData.niveau_max,
          nb_risques: communeData.nb_risques,
        },
      });
    },
    [map, data, onFeatureClick]
  );

  // Fetch data
  useEffect(() => {
    if (isActive && data.length === 0) {
      fetchData();
    }
  }, [isActive, data.length, fetchData]);

  // Init layers
  useEffect(() => {
    if (!map || loadedRef.current || data.length === 0) return;

    const setup = () => {
      if (map.getSource(SOURCE_ID)) {
        // Update source
        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
        source.setData(buildGeoJSON());
        return;
      }

      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: buildGeoJSON(),
      });

      // Cercles par commune
      map.addLayer({
        id: MARKERS_LAYER,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9, 12,
            12, 20,
            14, 8,
          ],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.6,
          "circle-stroke-width": 2,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-opacity": 0.9,
        },
      });

      // Labels
      map.addLayer({
        id: LABELS_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        layout: {
          "text-field": ["get", "label"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9, 8,
            12, 11,
          ],
          "text-offset": [0, 0],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.5)",
          "text-halo-width": 1,
        },
      });

      loadedRef.current = true;

      map.on("mouseenter", MARKERS_LAYER, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", MARKERS_LAYER, () => {
        map.getCanvas().style.cursor = "";
      });
    };

    if (map.isStyleLoaded()) {
      setup();
    } else {
      map.on("load", setup);
    }
  }, [map, data]);

  // Update GeoJSON when data changes
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
              niveau_max: d.niveau_max,
              nb_risques: d.nb_risques,
              color: NIVEAU_COLORS[d.niveau_max] || "#94a3b8",
              label: `${d.nb_risques}`,
            },
          };
        }),
    };
  }

  // Toggle visibility
  useEffect(() => {
    if (!map || !loadedRef.current) return;
    const vis = isActive ? "visible" : "none";
    [MARKERS_LAYER, LABELS_LAYER].forEach((id) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, "visibility", vis);
      }
    });
  }, [map, isActive]);

  // Click handler
  useEffect(() => {
    if (!map || !isActive) return;
    map.on("click", MARKERS_LAYER, handleClick);
    return () => {
      map.off("click", MARKERS_LAYER, handleClick);
    };
  }, [map, isActive, handleClick]);

  return null;
}
