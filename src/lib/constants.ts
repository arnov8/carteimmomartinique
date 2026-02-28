// Centre de la Martinique
export const MARTINIQUE_CENTER = {
  lng: -61.0242,
  lat: 14.6415,
} as const;

export const DEFAULT_ZOOM = 10;
export const MIN_ZOOM = 9;
export const MAX_ZOOM = 18;

// Seuils de zoom pour les couches
export const ZOOM_HEATMAP_MAX = 12;
export const ZOOM_POINTS_MIN = 13;
export const ZOOM_CADASTRE_MIN = 14;

// Fond de carte
export const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Couleurs des couches
export const LAYER_COLORS = {
  dvf: {
    low: "#22c55e",
    mid: "#eab308",
    high: "#ef4444",
  },
  risques: {
    sismique: "#8b5cf6",
    inondation: "#3b82f6",
    mouvement_terrain: "#92400e",
    submersion_marine: "#1e3a5f",
    volcanique: "#dc2626",
  },
  plu: {
    U: "#d1d5db",
    AU: "#f97316",
    A: "#86efac",
    N: "#166534",
  },
  permis: {
    en_cours: "#3b82f6",
    accorde: "#22c55e",
    refuse: "#ef4444",
  },
} as const;

// Catégories de couches
export const LAYER_CATEGORIES = [
  {
    id: "marche",
    label: "Marché",
    layers: [
      { id: "dvf", label: "Prix immobiliers (DVF)", icon: "euro" },
      { id: "annonces", label: "Annonces en cours", icon: "home" },
    ],
  },
  {
    id: "territoire",
    label: "Territoire",
    layers: [
      { id: "plu", label: "Urbanisme (PLU)", icon: "map" },
      { id: "cadastre", label: "Cadastre parcellaire", icon: "square" },
      { id: "permis", label: "Permis de construire", icon: "building" },
    ],
  },
  {
    id: "environnement",
    label: "Environnement",
    layers: [
      { id: "risques", label: "Risques naturels", icon: "alert-triangle" },
    ],
  },
  {
    id: "socio-eco",
    label: "Socio-économie",
    layers: [
      { id: "attractivite", label: "Score d'attractivité", icon: "trending-up" },
      { id: "vacance", label: "Logements vacants", icon: "building-2" },
      { id: "social", label: "Parc social", icon: "users" },
    ],
  },
] as const;

// Communes de la Martinique
export const COMMUNES_MARTINIQUE = [
  "L'Ajoupa-Bouillon",
  "Les Anses-d'Arlet",
  "Basse-Pointe",
  "Bellefontaine",
  "Le Carbet",
  "Case-Pilote",
  "Le Diamant",
  "Ducos",
  "Fonds-Saint-Denis",
  "Fort-de-France",
  "Le François",
  "Grand'Rivière",
  "Gros-Morne",
  "Le Lamentin",
  "Le Lorrain",
  "Macouba",
  "Le Marigot",
  "Le Marin",
  "Le Morne-Rouge",
  "Le Morne-Vert",
  "Le Prêcheur",
  "Rivière-Pilote",
  "Rivière-Salée",
  "Le Robert",
  "Saint-Esprit",
  "Saint-Joseph",
  "Saint-Pierre",
  "Sainte-Anne",
  "Sainte-Luce",
  "Sainte-Marie",
  "Schœlcher",
  "Les Trois-Îlets",
  "La Trinité",
  "Le Vauclin",
] as const;
