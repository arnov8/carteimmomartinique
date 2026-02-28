"use client";

import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Euro,
  AlertTriangle,
  Building,
  Home,
  Building2,
  Users,
  TrendingUp,
  Map as MapIcon,
} from "lucide-react";
import TransactionPanel from "@/components/sidebar/panels/TransactionPanel";
import RisquesPanel from "@/components/sidebar/panels/RisquesPanel";
import PermisPanel from "@/components/sidebar/panels/PermisPanel";
import AnnoncePanel from "@/components/sidebar/panels/AnnoncePanel";
import VacancePanel from "@/components/sidebar/panels/VacancePanel";
import SocialPanel from "@/components/sidebar/panels/SocialPanel";
import AttractivitePanel from "@/components/sidebar/panels/AttractivitePanel";

export interface TabCounts {
  transactions: number;
  risques: number;
  permis: number;
  annonces: number;
  vacance: number;
  social: number;
  attractivite: number;
}

export interface SelectedFeature {
  commune: string;
  address?: string;
  clickedType: string;
  clickedData: Record<string, unknown>;
  // Per-tab data
  transactionData?: Record<string, unknown>;
  risquesData?: Record<string, unknown>;
  permisData?: Record<string, unknown>;
  annonceData?: Record<string, unknown>;
  vacanceData?: Record<string, unknown>;
  socialData?: Record<string, unknown>;
  attractiviteData?: Record<string, unknown>;
}

interface DemoRightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  feature: SelectedFeature | null;
  tabCounts: TabCounts;
}

const TABS = [
  { id: "transactions", label: "Transactions", Icon: Euro },
  { id: "risques", label: "Risques", Icon: AlertTriangle },
  { id: "permis", label: "Permis", Icon: Building },
  { id: "annonces", label: "Annonces", Icon: Home },
  { id: "vacance", label: "Vacance", Icon: Building2 },
  { id: "social", label: "Social", Icon: Users },
  { id: "attractivite", label: "Attractivité", Icon: TrendingUp },
  { id: "urbanisme", label: "Urbanisme", Icon: MapIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabContent({
  tabId,
  feature,
}: {
  tabId: TabId;
  feature: SelectedFeature;
}) {
  switch (tabId) {
    case "transactions":
      return feature.transactionData ? (
        <TransactionPanel data={feature.transactionData} />
      ) : (
        <EmptyTab message="Aucune transaction DVF enregistrée" />
      );
    case "risques":
      return feature.risquesData ? (
        <RisquesPanel data={feature.risquesData} />
      ) : (
        <EmptyTab message="Aucun risque référencé" />
      );
    case "permis":
      return feature.permisData ? (
        <PermisPanel data={feature.permisData} />
      ) : (
        <EmptyTab message="Aucun permis de construire" />
      );
    case "annonces":
      return feature.annonceData ? (
        <AnnoncePanel data={feature.annonceData} />
      ) : (
        <EmptyTab message="Aucune annonce en cours" />
      );
    case "vacance":
      return feature.vacanceData ? (
        <VacancePanel data={feature.vacanceData} />
      ) : (
        <EmptyTab message="Pas de données de vacance" />
      );
    case "social":
      return feature.socialData ? (
        <SocialPanel data={feature.socialData} />
      ) : (
        <EmptyTab message="Pas de données de parc social" />
      );
    case "attractivite":
      return feature.attractiviteData ? (
        <AttractivitePanel data={feature.attractiviteData} />
      ) : (
        <EmptyTab message="Pas de score d'attractivité" />
      );
    case "urbanisme":
      return (
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 font-medium">
              Commune de {feature.commune}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Parcelle couverte par le Plan Local d&apos;Urbanisme (PLU)
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              Les données d&apos;urbanisme détaillées seront disponibles après
              la connexion à Supabase.
            </p>
          </div>
        </div>
      );
    default:
      return <EmptyTab message="Données non disponibles" />;
  }
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <MapPin className="h-5 w-5 text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

export default function DemoRightPanel({
  isOpen,
  onClose,
  feature,
  tabCounts,
}: DemoRightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("transactions");

  // Reset to best tab when feature changes
  useEffect(() => {
    if (!feature) return;
    // Default to clicked type's tab, else first tab with data
    const typeToTab: Record<string, TabId> = {
      transaction: "transactions",
      risque: "risques",
      permis: "permis",
      annonce: "annonces",
      vacance: "vacance",
      social: "social",
      attractivite: "attractivite",
    };
    const defaultTab = typeToTab[feature.clickedType];
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else {
      const firstWithData = TABS.find(
        (t) => tabCounts[t.id as keyof TabCounts] > 0
      );
      setActiveTab(firstWithData?.id || "transactions");
    }
  }, [feature, tabCounts]);

  if (!isOpen || !feature) return null;

  return (
    <div className="hidden md:flex flex-col w-[400px] h-full bg-white border-l border-gray-200 shadow-xl flex-shrink-0 animate-slide-in-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
              <h2 className="text-sm font-bold text-gray-900 truncate font-heading">
                {feature.address || feature.commune}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {feature.commune}
              {feature.clickedData?.surface_reelle_bati != null &&
                ` • ${String(feature.clickedData.surface_reelle_bati)}m²`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
        {TABS.map((tab) => {
          const count =
            tab.id === "urbanisme"
              ? 0
              : tabCounts[tab.id as keyof TabCounts] || 0;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                isActive
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <TabContent tabId={activeTab} feature={feature} />
      </div>
    </div>
  );
}

// ── Mobile variant ────────────────────────────────────────────────────────

export function DemoRightPanelMobile({
  isOpen,
  onClose,
  feature,
  tabCounts,
}: DemoRightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("transactions");

  useEffect(() => {
    if (!feature) return;
    const typeToTab: Record<string, TabId> = {
      transaction: "transactions",
      risque: "risques",
      permis: "permis",
      annonce: "annonces",
      vacance: "vacance",
      social: "social",
      attractivite: "attractivite",
    };
    const defaultTab = typeToTab[feature.clickedType];
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [feature]);

  if (!isOpen || !feature) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 animate-slide-in-up">
      <div className="bg-white rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-gray-900 truncate font-heading">
                {feature.address || feature.commune}
              </h2>
              <p className="text-xs text-gray-500 truncate">
                {feature.commune}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
          {TABS.map((tab) => {
            const count =
              tab.id === "urbanisme"
                ? 0
                : tabCounts[tab.id as keyof TabCounts] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap border-b-2 flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className="px-1 py-0.5 text-[9px] font-bold bg-gray-100 text-gray-500 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <TabContent tabId={activeTab} feature={feature} />
        </div>
      </div>
    </div>
  );
}
