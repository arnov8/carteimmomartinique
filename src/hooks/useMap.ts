"use client";

import { useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { MARTINIQUE_CENTER, DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, MAP_STYLE } from "@/lib/constants";
import type { MapViewState } from "@/types";

export function useMap() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [viewState, setViewState] = useState<MapViewState>({
    lng: MARTINIQUE_CENTER.lng,
    lat: MARTINIQUE_CENTER.lat,
    zoom: DEFAULT_ZOOM,
  });
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = useCallback((container: HTMLDivElement) => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: [MARTINIQUE_CENTER.lng, MARTINIQUE_CENTER.lat],
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: [
        [-62.0, 14.2],
        [-60.5, 15.1],
      ],
      attributionControl: {},
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "bottom-right"
    );
    map.addControl(new maplibregl.ScaleControl(), "bottom-left");

    map.on("move", () => {
      const center = map.getCenter();
      setViewState({
        lng: center.lng,
        lat: center.lat,
        zoom: map.getZoom(),
      });
    });

    map.on("load", () => {
      setIsMapReady(true);
    });

    mapRef.current = map;
    mapContainerRef.current = container;
  }, []);

  const flyTo = useCallback((lng: number, lat: number, zoom?: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: zoom || 15,
      duration: 1500,
    });
  }, []);

  return {
    mapRef,
    mapContainerRef,
    viewState,
    isMapReady,
    initializeMap,
    flyTo,
  };
}
