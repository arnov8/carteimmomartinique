"use client";

import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import { ZOOM_CADASTRE_MIN } from "@/lib/constants";

interface CadastreLayerProps {
  map: maplibregl.Map | null;
  isActive: boolean;
}

const SOURCE_ID = "cadastre-source";
const RASTER_LAYER = "cadastre-raster";

const CADASTRE_TILE_URL =
  "https://data.geopf.fr/wmts?" +
  "SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0" +
  "&LAYER=CADASTRALPARCELS.PARCELLAIRE_EXPRESS" +
  "&STYLE=PCI%20vecteur" +
  "&TILEMATRIXSET=PM" +
  "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}" +
  "&FORMAT=image/png";

export default function CadastreLayer({ map, isActive }: CadastreLayerProps) {
  useEffect(() => {
    if (!map) return;

    // Ensure source exists
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "raster",
        tiles: [CADASTRE_TILE_URL],
        tileSize: 256,
        minzoom: ZOOM_CADASTRE_MIN,
        maxzoom: 20,
        attribution: "© IGN Cadastre",
      });
    }

    // Ensure layer exists
    if (!map.getLayer(RASTER_LAYER)) {
      map.addLayer({
        id: RASTER_LAYER,
        type: "raster",
        source: SOURCE_ID,
        minzoom: ZOOM_CADASTRE_MIN,
        layout: { visibility: isActive ? "visible" : "none" },
        paint: { "raster-opacity": 0.7 },
      });
    } else {
      map.setLayoutProperty(
        RASTER_LAYER,
        "visibility",
        isActive ? "visible" : "none"
      );
    }
  }, [map, isActive]);

  return null;
}
