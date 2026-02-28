"use client";

import { useState, useCallback } from "react";
import type { LayerId } from "@/types";

export function useLayers() {
  const [activeLayers, setActiveLayers] = useState<Set<LayerId>>(
    new Set(["dvf"])
  );

  const toggleLayer = useCallback((layerId: LayerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) {
        next.delete(layerId);
      } else {
        next.add(layerId);
      }
      return next;
    });
  }, []);

  const isLayerActive = useCallback(
    (layerId: LayerId) => activeLayers.has(layerId),
    [activeLayers]
  );

  return { activeLayers, toggleLayer, isLayerActive };
}
