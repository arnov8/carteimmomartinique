"use client";

import { useEffect, useRef } from "react";
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
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!map || loadedRef.current) return;

    const setup = () => {
      if (map.getSource(SOURCE_ID)) return;

      map.addSource(SOURCE_ID, {
        type: "raster",
        tiles: [CADASTRE_TILE_URL],
        tileSize: 256,
        minzoom: ZOOM_CADASTRE_MIN,
        maxzoom: 20,
        attribution: "© IGN Cadastre",
      });

      map.addLayer({
        id: RASTER_LAYER,
        type: "raster",
        source: SOURCE_ID,
        minzoom: ZOOM_CADASTRE_MIN,
        layout: { visibility: "none" },
        paint: {
          "raster-opacity": 0.7,
        },
      });

      loadedRef.current = true;
    };

    if (map.isStyleLoaded()) setup();
    else map.on("load", setup);
  }, [map]);

  useEffect(() => {
    if (!map || !loadedRef.current) return;
    const vis = isActive ? "visible" : "none";
    if (map.getLayer(RASTER_LAYER)) {
      map.setLayoutProperty(RASTER_LAYER, "visibility", vis);
    }
  }, [map, isActive]);

  return null;
}
