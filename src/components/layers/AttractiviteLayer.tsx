"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import type { MapMouseEvent } from "maplibre-gl";
import type { SidebarContent } from "@/types";

interface AttractiviteLayerProps {
  map: maplibregl.Map | null;
  isActive: boolean;
  onFeatureClick: (content: SidebarContent) => void;
}

const SOURCE_ID = "attractivite-source";
const CIRCLES_LAYER = "attractivite-circles";
const LABELS_LAYER = "attractivite-labels";

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

function scoreToColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 65) return "#84cc16";
  if (score >= 50) return "#eab308";
  if (score >= 35) return "#f97316";
  return "#ef4444";
}

function scoreToLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Bon";
  if (score >= 50) return "Moyen";
  if (score >= 35) return "Faible";
  return "Critique";
}

interface CommuneScore {
  commune: string;
  code_commune: string;
  score: number;
  details: {
    demographie: number;
    economie: number;
    immobilier: number;
    cadre_vie: number;
  };
}

export default function AttractiviteLayer({
  map,
  isActive,
  onFeatureClick,
}: AttractiviteLayerProps) {
  const loadedRef = useRef(false);
  const [data, setData] = useState<CommuneScore[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch INSEE + LOVAC + social to compute score
      const [inseeRes, lovacRes, socialRes] = await Promise.all([
        fetch("/api/insee"),
        fetch("/api/lovac"),
        fetch("/api/social"),
      ]);

      const inseeJson = await inseeRes.json();
      const lovacJson = await lovacRes.json();
      const socialJson = await socialRes.json();

      const inseeData = inseeJson.data || [];
      const lovacData = lovacJson.data || [];
      const socialData = socialJson.par_commune || [];

      // Compute score per commune
      const scores: CommuneScore[] = inseeData.map(
        (insee: {
          commune: string;
          code_commune: string;
          population: number;
          evolution_population_5ans: number | null;
          revenu_median: number;
          taux_chomage: number | null;
          menages: number;
        }) => {
          const lovac = lovacData.find(
            (l: { code_commune: string }) =>
              l.code_commune === insee.code_commune
          );
          const social = socialData.find(
            (s: { code_commune: string }) =>
              s.code_commune === insee.code_commune
          );

          // Demographic score (0-100) based on population growth
          const evol = insee.evolution_population_5ans ?? 0;
          const demographie = Math.min(100, Math.max(0, 50 + evol * 10));

          // Economic score (0-100) based on income and employment
          const revenuRef = 20000;
          const economie = Math.min(
            100,
            Math.max(
              0,
              (insee.revenu_median / revenuRef) * 50 +
                (100 - (insee.taux_chomage || 25)) * 0.5
            )
          );

          // Real estate score (0-100) - inverse vacancy rate
          const tauxVacance = lovac?.taux_vacance ?? 10;
          const immobilier = Math.min(
            100,
            Math.max(0, 100 - tauxVacance * 3)
          );

          // Quality of life (0-100) - social housing availability
          const socialTotal = social?.total ?? 0;
          const socialRatio =
            insee.population > 0
              ? (socialTotal / (insee.menages || 1)) * 100
              : 0;
          const cadre_vie = Math.min(
            100,
            Math.max(0, 50 + (socialRatio > 5 ? 20 : 0) + (insee.population > 5000 ? 15 : 0) + (tauxVacance < 10 ? 15 : 0))
          );

          const score = Math.round(
            demographie * 0.25 +
              economie * 0.3 +
              immobilier * 0.25 +
              cadre_vie * 0.2
          );

          return {
            commune: insee.commune,
            code_commune: insee.code_commune,
            score,
            details: {
              demographie: Math.round(demographie),
              economie: Math.round(economie),
              immobilier: Math.round(immobilier),
              cadre_vie: Math.round(cadre_vie),
            },
          };
        }
      );

      setData(scores);
    } catch (e) {
      console.error("Attractivite fetch error:", e);
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
        title: `Attractivité — ${commune}`,
        data: {
          panel: "attractivite",
          commune,
          score: communeData.score,
          details: JSON.stringify(communeData.details),
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
            ["zoom"],
            9, 14,
            12, 22,
            14, 10,
          ],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.6,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-opacity": 0.9,
        },
      });

      map.addLayer({
        id: LABELS_LAYER,
        type: "symbol",
        source: SOURCE_ID,
        layout: {
          "text-field": ["get", "label"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 9, 9, 12, 12],
          "text-allow-overlap": true,
          "text-font": ["Open Sans Bold"],
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.6)",
          "text-halo-width": 1.2,
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
              score: d.score,
              color: scoreToColor(d.score),
              label: `${d.score}`,
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
