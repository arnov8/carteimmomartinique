"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, MapPin } from "lucide-react";

interface SearchResult {
  label: string;
  context: string;
  lng: number;
  lat: number;
  type: string;
}

interface SearchBarProps {
  onSelect: (lng: number, lat: number, zoom?: number) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchBAN = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        limit: "5",
        lat: "14.6415",
        lon: "-61.0242",
        type: "housenumber,street,municipality",
      });
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?${params}`
      );
      const data = await res.json();

      const mapped: SearchResult[] = data.features.map(
        (f: {
          properties: { label: string; context: string; type: string };
          geometry: { coordinates: [number, number] };
        }) => ({
          label: f.properties.label,
          context: f.properties.context,
          lng: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
          type: f.properties.type,
        })
      );
      setResults(mapped);
      setIsOpen(mapped.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => searchBAN(value), 300);
    },
    [searchBAN]
  );

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setQuery(result.label);
      setIsOpen(false);
      setResults([]);
      const zoom = result.type === "municipality" ? 13 : 16;
      onSelect(result.lng, result.lat, zoom);
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-shadow focus-within:shadow-xl focus-within:border-blue-200">
        <Search className="ml-3 h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Rechercher une adresse, une commune..."
          className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
        />
        {isLoading && (
          <div className="mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-3.5 w-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-2.5 px-3.5 py-2.5 hover:bg-blue-50 transition-colors text-left"
            >
              <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {result.label}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {result.context}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
