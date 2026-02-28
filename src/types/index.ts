export type LayerId =
  | "dvf"
  | "annonces"
  | "plu"
  | "cadastre"
  | "permis"
  | "risques"
  | "attractivite"
  | "vacance"
  | "social";

export interface MapViewState {
  lng: number;
  lat: number;
  zoom: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface TransactionDVF {
  id: string;
  date_mutation: string;
  nature_mutation: string;
  valeur_fonciere: number;
  adresse: string;
  code_postal: string;
  commune: string;
  code_commune: string;
  type_local: string;
  surface_reelle_bati: number | null;
  nombre_pieces: number | null;
  surface_terrain: number | null;
  longitude: number;
  latitude: number;
  prix_m2: number | null;
}

export interface ParcelleCadastrale {
  id: string;
  commune: string;
  prefixe: string;
  section: string;
  numero: string;
  contenance: number;
  code_commune: string;
}

export interface ZonePLU {
  id: string;
  commune: string;
  zone_type: "U" | "AU" | "A" | "N";
  zone_code: string;
  libelle: string;
  reglements_url: string | null;
}

export type NiveauRisque = "faible" | "moyen" | "fort" | "tres_fort";
export type TypeRisque =
  | "sismique"
  | "inondation"
  | "mouvement_terrain"
  | "submersion_marine"
  | "volcanique";

export interface RisqueNaturel {
  id: string;
  commune: string;
  type_risque: TypeRisque;
  niveau: NiveauRisque;
  description: string;
  source: string;
}

export interface DonneeINSEE {
  id: string;
  code_iris: string;
  code_commune: string;
  commune: string;
  population: number;
  menages: number;
  revenu_median: number;
  taux_chomage: number | null;
  evolution_population_5ans: number | null;
}

export interface PermisConstruire {
  id: string;
  numero_permis: string;
  date_depot: string;
  date_decision: string | null;
  decision: "accorde" | "refuse" | "en_cours";
  type_construction: "individuel" | "collectif" | "tertiaire" | "industriel";
  nombre_logements: number;
  surface_plancher: number;
  adresse: string;
  commune: string;
  code_commune: string;
  longitude: number;
  latitude: number;
  maitre_ouvrage: string | null;
  nature_travaux:
    | "construction_neuve"
    | "extension"
    | "renovation"
    | "demolition";
}

export interface LogementVacant {
  id: string;
  code_commune: string;
  commune: string;
  nb_logements_vacants: number;
  taux_vacance: number;
  duree_vacance_moyenne: number | null;
  annee: number;
}

export interface ParcSocial {
  id: string;
  code_commune: string;
  commune: string;
  bailleur: string;
  nb_logements: number;
  type_financement: string | null;
  annee_construction: number | null;
  nb_pieces: number | null;
  adresse: string | null;
  longitude: number | null;
  latitude: number | null;
  loyer_moyen: number | null;
}

export interface AnnonceImmo {
  id: string;
  titre: string;
  prix: number;
  type_bien: "maison" | "appartement" | "terrain" | "local_commercial";
  surface: number;
  nb_pieces: number | null;
  adresse: string | null;
  commune: string;
  code_commune: string;
  longitude: number;
  latitude: number;
  photo_url: string | null;
  lien_annonce: string;
  date_publication: string;
  actif: boolean;
  prix_m2: number | null;
}

export interface SidebarContent {
  type:
    | "transaction"
    | "zone_stats"
    | "parcelle"
    | "risque"
    | "plu"
    | "permis"
    | "annonce"
    | "analyse"
    | "vacance"
    | "social"
    | "attractivite";
  data: Record<string, unknown>;
  title: string;
}
