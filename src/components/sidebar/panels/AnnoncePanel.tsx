"use client";

import {
  Home,
  MapPin,
  Ruler,
  DoorOpen,
  Calendar,
  ExternalLink,
  Euro,
} from "lucide-react";
import { formatPriceFull, formatPriceM2, formatDate } from "@/lib/format";

interface AnnoncePanelProps {
  data: Record<string, unknown>;
}

const TYPE_LABELS: Record<string, string> = {
  maison: "Maison",
  appartement: "Appartement",
  terrain: "Terrain",
  local_commercial: "Local commercial",
};

const TYPE_COLORS: Record<string, string> = {
  maison: "bg-orange-100 text-orange-700",
  appartement: "bg-blue-100 text-blue-700",
  terrain: "bg-green-100 text-green-700",
  local_commercial: "bg-violet-100 text-violet-700",
};

export default function AnnoncePanel({ data }: AnnoncePanelProps) {
  const prix = data.prix as number;
  const type = data.type_bien as string;
  const surface = data.surface as number;
  const nbPieces = data.nb_pieces as number | null;
  const commune = data.commune as string;
  const prixM2 = data.prix_m2 as number | null;
  const lien = data.lien_annonce as string;
  const datePublication = data.date_publication as string;
  const photoUrl = data.photo_url as string | null;

  return (
    <div className="space-y-5">
      {/* Photo */}
      {photoUrl && (
        <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video">
          <img
            src={photoUrl}
            alt="Photo du bien"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Prix */}
      <div className="text-center">
        <p className="text-3xl font-bold text-gray-900">
          {formatPriceFull(prix)}
        </p>
        {prixM2 && (
          <p className="text-sm text-gray-500 mt-0.5">
            {formatPriceM2(prixM2)}
          </p>
        )}
      </div>

      {/* Type badge */}
      <div className="flex justify-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            TYPE_COLORS[type] || "bg-gray-100 text-gray-700"
          }`}
        >
          {TYPE_LABELS[type] || type}
        </span>
      </div>

      {/* Caractéristiques */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Ruler className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
              Surface
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900">{surface} m²</p>
        </div>

        {nbPieces && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <DoorOpen className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Pièces
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {nbPieces} pièce{nbPieces > 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
              Commune
            </span>
          </div>
          <p className="text-sm font-bold text-gray-900">{commune}</p>
        </div>

        {datePublication && (
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                Publication
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {formatDate(datePublication)}
            </p>
          </div>
        )}
      </div>

      {/* Lien annonce */}
      {lien && (
        <a
          href={lien}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 text-sm font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Voir l&apos;annonce complète
        </a>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        Annonce collectée automatiquement — vérifiez les informations
      </p>
    </div>
  );
}
