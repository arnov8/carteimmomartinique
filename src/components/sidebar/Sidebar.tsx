"use client";

import { X, MapPin } from "lucide-react";
import type { SidebarContent } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  content: SidebarContent | null;
}

export default function Sidebar({ isOpen, onClose, content }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block absolute top-0 left-0 h-full z-20 animate-slide-in-left">
        <div className="h-full w-[420px] bg-white shadow-2xl border-r border-gray-100 flex flex-col">
          <SidebarHeader title={content?.title} onClose={onClose} />
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            <SidebarBody content={content} />
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-20 animate-slide-in-up">
        <div className="bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <SidebarHeader title={content?.title} onClose={onClose} />
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <SidebarBody content={content} />
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarHeader({
  title,
  onClose,
}: {
  title?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <h2 className="text-base font-semibold text-gray-900">
          {title || "Détails"}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}

function SidebarBody({ content }: { content: SidebarContent | null }) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <MapPin className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">
          Cliquez sur un élément de la carte pour voir les détails
        </p>
      </div>
    );
  }

  // Placeholder - sera enrichi avec les vraies données par couche
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          Les données seront affichées ici une fois les couches connectées.
        </p>
      </div>
    </div>
  );
}
