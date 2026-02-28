"use client";

import { useEffect, useRef } from "react";

interface MapContainerProps {
  onMapInit: (container: HTMLDivElement) => void;
}

export default function MapContainer({ onMapInit }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (containerRef.current && !initializedRef.current) {
      initializedRef.current = true;
      onMapInit(containerRef.current);
    }
  }, [onMapInit]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
