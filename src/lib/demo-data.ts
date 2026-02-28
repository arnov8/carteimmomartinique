/**
 * Données de démonstration pour tester l'interface sans Supabase.
 * Positions réelles en Martinique.
 */

// ── DVF Transactions (GeoJSON) ──────────────────────────────────────────────

const dvfTransactions = [
  // Fort-de-France
  { id: "dvf-1", lng: -61.0588, lat: 14.6065, prix: 185000, prix_m2: 2150, surface: 86, pieces: 4, type: "Appartement", commune: "Fort-de-France", code_postal: "97200", adresse: "12 Rue Victor Hugo", date: "2025-06-15" },
  { id: "dvf-2", lng: -61.0632, lat: 14.6012, prix: 320000, prix_m2: 2800, surface: 114, pieces: 5, type: "Maison", commune: "Fort-de-France", code_postal: "97200", adresse: "8 Chemin de Didier", date: "2025-04-22" },
  { id: "dvf-3", lng: -61.0510, lat: 14.6120, prix: 125000, prix_m2: 1650, surface: 76, pieces: 3, type: "Appartement", commune: "Fort-de-France", code_postal: "97200", adresse: "45 Boulevard du Général de Gaulle", date: "2025-02-10" },
  { id: "dvf-4", lng: -61.0685, lat: 14.5985, prix: 410000, prix_m2: 3200, surface: 128, pieces: 6, type: "Maison", commune: "Fort-de-France", code_postal: "97200", adresse: "3 Route de Balata", date: "2024-11-08" },
  { id: "dvf-5", lng: -61.0545, lat: 14.6080, prix: 95000, prix_m2: 1480, surface: 64, pieces: 2, type: "Appartement", commune: "Fort-de-France", code_postal: "97200", adresse: "22 Rue Schoelcher", date: "2025-07-03" },

  // Le Lamentin
  { id: "dvf-6", lng: -60.9960, lat: 14.6180, prix: 275000, prix_m2: 2100, surface: 131, pieces: 5, type: "Maison", commune: "Le Lamentin", code_postal: "97232", adresse: "15 Lotissement Place d'Armes", date: "2025-03-18" },
  { id: "dvf-7", lng: -61.0020, lat: 14.6250, prix: 195000, prix_m2: 1800, surface: 108, pieces: 4, type: "Maison", commune: "Le Lamentin", code_postal: "97232", adresse: "Résidence Les Tamarins", date: "2025-01-25" },
  { id: "dvf-8", lng: -60.9890, lat: 14.6100, prix: 350000, prix_m2: 2400, surface: 146, pieces: 5, type: "Maison", commune: "Le Lamentin", code_postal: "97232", adresse: "7 Chemin de Long Pré", date: "2024-09-12" },

  // Schœlcher
  { id: "dvf-9", lng: -61.0890, lat: 14.6210, prix: 290000, prix_m2: 2650, surface: 109, pieces: 4, type: "Maison", commune: "Schœlcher", code_postal: "97233", adresse: "18 Route de Fond Lahaye", date: "2025-05-28" },
  { id: "dvf-10", lng: -61.0820, lat: 14.6250, prix: 155000, prix_m2: 2200, surface: 70, pieces: 3, type: "Appartement", commune: "Schœlcher", code_postal: "97233", adresse: "Résidence Batelière", date: "2025-02-14" },

  // Les Trois-Îlets
  { id: "dvf-11", lng: -61.0380, lat: 14.5360, prix: 450000, prix_m2: 3500, surface: 129, pieces: 5, type: "Maison", commune: "Les Trois-Îlets", code_postal: "97229", adresse: "Anse Mitan", date: "2025-06-01" },
  { id: "dvf-12", lng: -61.0450, lat: 14.5420, prix: 210000, prix_m2: 2900, surface: 72, pieces: 3, type: "Appartement", commune: "Les Trois-Îlets", code_postal: "97229", adresse: "Pointe du Bout", date: "2025-04-10" },

  // Sainte-Anne
  { id: "dvf-13", lng: -60.8650, lat: 14.4370, prix: 380000, prix_m2: 3100, surface: 122, pieces: 5, type: "Maison", commune: "Sainte-Anne", code_postal: "97227", adresse: "Grande Anse", date: "2025-05-15" },
  { id: "dvf-14", lng: -60.8720, lat: 14.4430, prix: 175000, prix_m2: 2400, surface: 73, pieces: 3, type: "Appartement", commune: "Sainte-Anne", code_postal: "97227", adresse: "Centre-Bourg", date: "2025-03-22" },

  // Le Robert
  { id: "dvf-15", lng: -60.9390, lat: 14.6760, prix: 225000, prix_m2: 1900, surface: 118, pieces: 4, type: "Maison", commune: "Le Robert", code_postal: "97231", adresse: "Bourg", date: "2025-01-30" },
  { id: "dvf-16", lng: -60.9320, lat: 14.6820, prix: 165000, prix_m2: 1750, surface: 94, pieces: 3, type: "Maison", commune: "Le Robert", code_postal: "97231", adresse: "Pointe Lynch", date: "2024-12-18" },

  // Ducos
  { id: "dvf-17", lng: -60.9720, lat: 14.5750, prix: 240000, prix_m2: 1850, surface: 130, pieces: 5, type: "Maison", commune: "Ducos", code_postal: "97224", adresse: "Quartier Petit Bourg", date: "2025-04-05" },

  // Le Marin
  { id: "dvf-18", lng: -60.8700, lat: 14.4680, prix: 295000, prix_m2: 2700, surface: 109, pieces: 4, type: "Maison", commune: "Le Marin", code_postal: "97290", adresse: "Marina du Marin", date: "2025-06-20" },

  // Saint-Pierre
  { id: "dvf-19", lng: -61.1760, lat: 14.7490, prix: 145000, prix_m2: 1200, surface: 121, pieces: 4, type: "Maison", commune: "Saint-Pierre", code_postal: "97250", adresse: "Centre-Ville", date: "2025-02-28" },

  // Sainte-Luce
  { id: "dvf-20", lng: -60.9250, lat: 14.4710, prix: 310000, prix_m2: 2500, surface: 124, pieces: 4, type: "Maison", commune: "Sainte-Luce", code_postal: "97228", adresse: "Anse Corps de Garde", date: "2025-05-08" },

  // Le Diamant
  { id: "dvf-21", lng: -61.0200, lat: 14.4740, prix: 360000, prix_m2: 2900, surface: 124, pieces: 5, type: "Maison", commune: "Le Diamant", code_postal: "97223", adresse: "Grande Anse du Diamant", date: "2025-03-01" },
  { id: "dvf-22", lng: -61.0150, lat: 14.4800, prix: 198000, prix_m2: 2350, surface: 84, pieces: 3, type: "Appartement", commune: "Le Diamant", code_postal: "97223", adresse: "Bourg du Diamant", date: "2024-10-20" },

  // Le François
  { id: "dvf-23", lng: -60.9020, lat: 14.6180, prix: 255000, prix_m2: 1950, surface: 131, pieces: 5, type: "Maison", commune: "Le François", code_postal: "97240", adresse: "Quartier Simon", date: "2025-07-10" },
  { id: "dvf-24", lng: -60.9100, lat: 14.6250, prix: 145000, prix_m2: 1700, surface: 85, pieces: 3, type: "Appartement", commune: "Le François", code_postal: "97240", adresse: "Centre-Bourg", date: "2025-01-15" },

  // Rivière-Salée
  { id: "dvf-25", lng: -60.9830, lat: 14.5300, prix: 220000, prix_m2: 1800, surface: 122, pieces: 4, type: "Maison", commune: "Rivière-Salée", code_postal: "97215", adresse: "Petit Bourg", date: "2025-04-30" },

  // Gros-Morne
  { id: "dvf-26", lng: -61.0330, lat: 14.7200, prix: 135000, prix_m2: 1100, surface: 123, pieces: 4, type: "Maison", commune: "Gros-Morne", code_postal: "97213", adresse: "Bourg", date: "2025-02-05" },

  // Saint-Joseph
  { id: "dvf-27", lng: -61.0420, lat: 14.6700, prix: 180000, prix_m2: 1450, surface: 124, pieces: 4, type: "Maison", commune: "Saint-Joseph", code_postal: "97212", adresse: "Centre", date: "2025-06-12" },

  // La Trinité
  { id: "dvf-28", lng: -60.9650, lat: 14.7400, prix: 205000, prix_m2: 1600, surface: 128, pieces: 5, type: "Maison", commune: "La Trinité", code_postal: "97220", adresse: "Tartane", date: "2025-03-08" },

  // Rivière-Pilote
  { id: "dvf-29", lng: -60.8930, lat: 14.4650, prix: 195000, prix_m2: 1500, surface: 130, pieces: 4, type: "Maison", commune: "Rivière-Pilote", code_postal: "97211", adresse: "Centre-Bourg", date: "2025-01-22" },

  // Le Vauclin
  { id: "dvf-30", lng: -60.8350, lat: 14.5450, prix: 230000, prix_m2: 1750, surface: 131, pieces: 5, type: "Maison", commune: "Le Vauclin", code_postal: "97280", adresse: "Pointe Faula", date: "2025-05-20" },
];

export function getDemoTransactionsGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: dvfTransactions.map((t) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [t.lng, t.lat],
      },
      properties: {
        id: t.id,
        date_mutation: t.date,
        nature_mutation: "Vente",
        valeur_fonciere: t.prix,
        adresse: t.adresse,
        code_postal: t.code_postal,
        commune: t.commune,
        type_local: t.type,
        surface_reelle_bati: t.surface,
        nombre_pieces: t.pieces,
        surface_terrain: t.type === "Maison" ? t.surface + 200 : null,
        prix_m2: t.prix_m2,
      },
    })),
  };
}

// ── Risques par commune ─────────────────────────────────────────────────────

export const DEMO_RISQUES = [
  { code_commune: "97209", commune: "Fort-de-France", type_risque: "sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)" },
  { code_commune: "97209", commune: "Fort-de-France", type_risque: "inondation", niveau: "moyen", description: "Risque d'inondation par débordement de la Rivière Madame" },
  { code_commune: "97209", commune: "Fort-de-France", type_risque: "mouvement_terrain", niveau: "moyen", description: "Glissements de terrain sur les mornes" },
  { code_commune: "97213", commune: "Le Lamentin", type_risque: "sismique", niveau: "fort", description: "Zone de sismicité 5" },
  { code_commune: "97213", commune: "Le Lamentin", type_risque: "inondation", niveau: "fort", description: "Zone inondable – plaine du Lamentin" },
  { code_commune: "97229", commune: "Les Trois-Îlets", type_risque: "submersion_marine", niveau: "moyen", description: "Risque de submersion marine – anse Mitan" },
  { code_commune: "97229", commune: "Les Trois-Îlets", type_risque: "sismique", niveau: "fort", description: "Zone de sismicité 5" },
  { code_commune: "97227", commune: "Sainte-Anne", type_risque: "submersion_marine", niveau: "fort", description: "Littoral exposé aux houles cycloniques" },
  { code_commune: "97250", commune: "Saint-Pierre", type_risque: "volcanique", niveau: "tres_fort", description: "Proximité de la Montagne Pelée – zone d'aléa majeur" },
  { code_commune: "97250", commune: "Saint-Pierre", type_risque: "sismique", niveau: "fort", description: "Zone de sismicité 5" },
  { code_commune: "97231", commune: "Le Robert", type_risque: "inondation", niveau: "moyen", description: "Zones basses inondables" },
  { code_commune: "97233", commune: "Schœlcher", type_risque: "mouvement_terrain", niveau: "fort", description: "Falaises littorales instables" },
  { code_commune: "97224", commune: "Ducos", type_risque: "inondation", niveau: "moyen", description: "Zone de marais – risque de crue" },
  { code_commune: "97290", commune: "Le Marin", type_risque: "submersion_marine", niveau: "moyen", description: "Marina exposée aux houles" },
  { code_commune: "97228", commune: "Sainte-Luce", type_risque: "sismique", niveau: "fort", description: "Zone de sismicité 5" },
];

// Positions des communes (lng, lat) pour affichage sur carte
export const COMMUNE_POSITIONS: Record<string, [number, number]> = {
  "97209": [-61.058, 14.607],   // Fort-de-France
  "97213": [-60.996, 14.618],   // Le Lamentin
  "97233": [-61.085, 14.623],   // Schœlcher
  "97229": [-61.038, 14.536],   // Les Trois-Îlets
  "97227": [-60.865, 14.437],   // Sainte-Anne
  "97231": [-60.939, 14.676],   // Le Robert
  "97224": [-60.972, 14.575],   // Ducos
  "97290": [-60.870, 14.468],   // Le Marin
  "97250": [-61.176, 14.749],   // Saint-Pierre
  "97228": [-60.925, 14.471],   // Sainte-Luce
  "97223": [-61.020, 14.474],   // Le Diamant
  "97240": [-60.902, 14.618],   // Le François
  "97215": [-60.983, 14.530],   // Rivière-Salée
  "97214": [-61.033, 14.720],   // Gros-Morne
  "97212": [-61.042, 14.670],   // Saint-Joseph
  "97220": [-60.965, 14.740],   // La Trinité
  "97211": [-60.893, 14.465],   // Rivière-Pilote
  "97280": [-60.835, 14.545],   // Le Vauclin
  "97225": [-60.968, 14.802],   // Le Lorrain
  "97226": [-60.860, 14.780],   // Sainte-Marie
  "97210": [-61.055, 14.749],   // Le Carbet
  "97222": [-61.075, 14.698],   // Case-Pilote
  "97234": [-61.100, 14.655],   // Bellefontaine
  "97216": [-61.103, 14.772],   // Le Morne-Rouge
  "97217": [-61.135, 14.790],   // Le Morne-Vert
  "97218": [-61.182, 14.810],   // Le Prêcheur
  "97219": [-61.030, 14.855],   // Grand'Rivière
  "97221": [-61.190, 14.870],   // Macouba
  "97230": [-60.985, 14.838],   // L'Ajoupa-Bouillon
  "97232": [-61.115, 14.828],   // Fonds-Saint-Denis
  "97235": [-60.932, 14.810],   // Basse-Pointe
  "97236": [-60.990, 14.770],   // Le Marigot
  "97237": [-61.010, 14.450],   // Saint-Esprit
};

// ── Permis de construire (GeoJSON) ──────────────────────────────────────────

export function getDemoPermisGeoJSON() {
  const permis = [
    { id: "pc-1", lng: -61.0550, lat: 14.6050, numero: "PC-972-2025-0012", date_depot: "2025-01-15", decision: "accorde", type: "individuel", logements: 1, surface: 120, commune: "Fort-de-France", adresse: "Lot. Les Hauts de Didier" },
    { id: "pc-2", lng: -61.0000, lat: 14.6200, numero: "PC-972-2025-0045", date_depot: "2025-03-20", decision: "en_cours", type: "collectif", logements: 24, surface: 2400, commune: "Le Lamentin", adresse: "ZAC de Californie" },
    { id: "pc-3", lng: -61.0850, lat: 14.6180, numero: "PC-972-2024-0198", date_depot: "2024-11-05", decision: "accorde", type: "individuel", logements: 1, surface: 150, commune: "Schœlcher", adresse: "Route de Fond Lahaye" },
    { id: "pc-4", lng: -61.0400, lat: 14.5380, numero: "PC-972-2025-0067", date_depot: "2025-04-10", decision: "refuse", type: "individuel", logements: 1, surface: 90, commune: "Les Trois-Îlets", adresse: "Anse Mitan" },
    { id: "pc-5", lng: -60.8680, lat: 14.4400, numero: "PC-972-2025-0089", date_depot: "2025-05-02", decision: "accorde", type: "collectif", logements: 12, surface: 1200, commune: "Sainte-Anne", adresse: "Centre-Bourg" },
    { id: "pc-6", lng: -60.9350, lat: 14.6800, numero: "PC-972-2025-0023", date_depot: "2025-02-08", decision: "en_cours", type: "individuel", logements: 1, surface: 135, commune: "Le Robert", adresse: "Quartier Vert Pré" },
    { id: "pc-7", lng: -60.9750, lat: 14.5800, numero: "PC-972-2024-0234", date_depot: "2024-10-15", decision: "accorde", type: "tertiaire", logements: 0, surface: 850, commune: "Ducos", adresse: "Zone d'activité La Jambette" },
    { id: "pc-8", lng: -61.0600, lat: 14.6100, numero: "PC-972-2025-0101", date_depot: "2025-06-01", decision: "en_cours", type: "collectif", logements: 36, surface: 3600, commune: "Fort-de-France", adresse: "Front de Mer" },
  ];

  return {
    type: "FeatureCollection" as const,
    features: permis.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [p.lng, p.lat],
      },
      properties: {
        id: p.id,
        numero_permis: p.numero,
        date_depot: p.date_depot,
        date_decision: p.decision === "en_cours" ? null : p.date_depot,
        decision: p.decision,
        type_construction: p.type,
        nombre_logements: p.logements,
        surface_plancher: p.surface,
        commune: p.commune,
        adresse: p.adresse,
        nature_travaux: "construction_neuve",
      },
    })),
  };
}

// ── Annonces immobilières (GeoJSON) ─────────────────────────────────────────

export function getDemoAnnoncesGeoJSON() {
  const annonces = [
    { id: "ann-1", lng: -61.0580, lat: 14.6040, titre: "Bel appartement T4 vue mer", prix: 215000, type_bien: "appartement", surface: 92, pieces: 4, commune: "Fort-de-France", prix_m2: 2337 },
    { id: "ann-2", lng: -61.0650, lat: 14.5990, titre: "Villa 5 pièces avec piscine", prix: 485000, type_bien: "maison", surface: 150, pieces: 5, commune: "Fort-de-France", prix_m2: 3233 },
    { id: "ann-3", lng: -61.0350, lat: 14.5350, titre: "Maison créole rénovée", prix: 520000, type_bien: "maison", surface: 140, pieces: 5, commune: "Les Trois-Îlets", prix_m2: 3714 },
    { id: "ann-4", lng: -60.8600, lat: 14.4350, titre: "T3 résidence bord de mer", prix: 189000, type_bien: "appartement", surface: 65, pieces: 3, commune: "Sainte-Anne", prix_m2: 2908 },
    { id: "ann-5", lng: -60.9950, lat: 14.6220, titre: "Terrain constructible 800m²", prix: 120000, type_bien: "terrain", surface: 800, pieces: null, commune: "Le Lamentin", prix_m2: 150 },
    { id: "ann-6", lng: -60.8750, lat: 14.4700, titre: "Local commercial Marina", prix: 350000, type_bien: "local_commercial", surface: 120, pieces: null, commune: "Le Marin", prix_m2: 2917 },
    { id: "ann-7", lng: -61.0880, lat: 14.6200, titre: "Appartement T3 Batelière", prix: 178000, type_bien: "appartement", surface: 68, pieces: 3, commune: "Schœlcher", prix_m2: 2618 },
    { id: "ann-8", lng: -60.9200, lat: 14.4750, titre: "Villa pieds dans l'eau", prix: 690000, type_bien: "maison", surface: 200, pieces: 6, commune: "Sainte-Luce", prix_m2: 3450 },
    { id: "ann-9", lng: -61.0180, lat: 14.4760, titre: "T4 vue Rocher du Diamant", prix: 245000, type_bien: "appartement", surface: 85, pieces: 4, commune: "Le Diamant", prix_m2: 2882 },
    { id: "ann-10", lng: -60.9000, lat: 14.6150, titre: "Terrain 1200m² François", prix: 95000, type_bien: "terrain", surface: 1200, pieces: null, commune: "Le François", prix_m2: 79 },
  ];

  return {
    type: "FeatureCollection" as const,
    features: annonces.map((a) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [a.lng, a.lat],
      },
      properties: {
        id: a.id,
        titre: a.titre,
        prix: a.prix,
        type_bien: a.type_bien,
        surface: a.surface,
        nb_pieces: a.pieces,
        commune: a.commune,
        prix_m2: a.prix_m2,
        date_publication: "2025-07-01",
        photo_url: null,
        lien_annonce: "#",
      },
    })),
  };
}

// ── Logements vacants (par commune) ─────────────────────────────────────────

export const DEMO_VACANCE = [
  { code_commune: "97209", commune: "Fort-de-France", taux_vacance: 14.2, nb_logements_vacants: 8500 },
  { code_commune: "97213", commune: "Le Lamentin", taux_vacance: 8.5, nb_logements_vacants: 2100 },
  { code_commune: "97233", commune: "Schœlcher", taux_vacance: 7.1, nb_logements_vacants: 850 },
  { code_commune: "97229", commune: "Les Trois-Îlets", taux_vacance: 11.8, nb_logements_vacants: 420 },
  { code_commune: "97227", commune: "Sainte-Anne", taux_vacance: 15.3, nb_logements_vacants: 680 },
  { code_commune: "97231", commune: "Le Robert", taux_vacance: 9.2, nb_logements_vacants: 1200 },
  { code_commune: "97224", commune: "Ducos", taux_vacance: 6.8, nb_logements_vacants: 580 },
  { code_commune: "97290", commune: "Le Marin", taux_vacance: 12.1, nb_logements_vacants: 450 },
  { code_commune: "97250", commune: "Saint-Pierre", taux_vacance: 18.5, nb_logements_vacants: 620 },
  { code_commune: "97228", commune: "Sainte-Luce", taux_vacance: 10.4, nb_logements_vacants: 390 },
  { code_commune: "97223", commune: "Le Diamant", taux_vacance: 13.5, nb_logements_vacants: 310 },
  { code_commune: "97240", commune: "Le François", taux_vacance: 9.8, nb_logements_vacants: 950 },
  { code_commune: "97215", commune: "Rivière-Salée", taux_vacance: 7.5, nb_logements_vacants: 520 },
  { code_commune: "97214", commune: "Gros-Morne", taux_vacance: 11.0, nb_logements_vacants: 480 },
  { code_commune: "97212", commune: "Saint-Joseph", taux_vacance: 8.9, nb_logements_vacants: 650 },
];

export function getDemoVacanceGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: DEMO_VACANCE.filter((v) => COMMUNE_POSITIONS[v.code_commune]).map((v) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: COMMUNE_POSITIONS[v.code_commune],
      },
      properties: {
        code_commune: v.code_commune,
        commune: v.commune,
        taux_vacance: v.taux_vacance,
        nb_logements_vacants: v.nb_logements_vacants,
      },
    })),
  };
}

// ── Parc social (par commune) ───────────────────────────────────────────────

export const DEMO_SOCIAL = [
  { code_commune: "97209", commune: "Fort-de-France", total: 12500, bailleurs: [{ nom: "SIMAR", nb: 5200 }, { nom: "OZANAM", nb: 4100 }, { nom: "SMHLM", nb: 3200 }] },
  { code_commune: "97213", commune: "Le Lamentin", total: 4800, bailleurs: [{ nom: "SIMAR", nb: 2100 }, { nom: "OZANAM", nb: 1800 }, { nom: "SMHLM", nb: 900 }] },
  { code_commune: "97233", commune: "Schœlcher", total: 2200, bailleurs: [{ nom: "SIMAR", nb: 1100 }, { nom: "OZANAM", nb: 700 }, { nom: "SMHLM", nb: 400 }] },
  { code_commune: "97231", commune: "Le Robert", total: 2800, bailleurs: [{ nom: "SIMAR", nb: 1200 }, { nom: "OZANAM", nb: 1000 }, { nom: "SMHLM", nb: 600 }] },
  { code_commune: "97224", commune: "Ducos", total: 1500, bailleurs: [{ nom: "SIMAR", nb: 800 }, { nom: "OZANAM", nb: 500 }, { nom: "SMHLM", nb: 200 }] },
  { code_commune: "97229", commune: "Les Trois-Îlets", total: 650, bailleurs: [{ nom: "SIMAR", nb: 350 }, { nom: "OZANAM", nb: 200 }, { nom: "SMHLM", nb: 100 }] },
  { code_commune: "97227", commune: "Sainte-Anne", total: 850, bailleurs: [{ nom: "SIMAR", nb: 450 }, { nom: "OZANAM", nb: 280 }, { nom: "SMHLM", nb: 120 }] },
  { code_commune: "97290", commune: "Le Marin", total: 920, bailleurs: [{ nom: "SIMAR", nb: 480 }, { nom: "OZANAM", nb: 300 }, { nom: "SMHLM", nb: 140 }] },
  { code_commune: "97250", commune: "Saint-Pierre", total: 1100, bailleurs: [{ nom: "SIMAR", nb: 550 }, { nom: "OZANAM", nb: 380 }, { nom: "SMHLM", nb: 170 }] },
  { code_commune: "97240", commune: "Le François", total: 2100, bailleurs: [{ nom: "SIMAR", nb: 900 }, { nom: "OZANAM", nb: 750 }, { nom: "SMHLM", nb: 450 }] },
];

export function getDemoSocialGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: DEMO_SOCIAL.filter((s) => COMMUNE_POSITIONS[s.code_commune]).map((s) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: COMMUNE_POSITIONS[s.code_commune],
      },
      properties: {
        code_commune: s.code_commune,
        commune: s.commune,
        total: s.total,
      },
    })),
  };
}

// ── Score d'attractivité (par commune) ──────────────────────────────────────

export const DEMO_ATTRACTIVITE = [
  { code_commune: "97209", commune: "Fort-de-France", score: 72, demographie: 65, economie: 80, immobilier: 60, cadre_vie: 55 },
  { code_commune: "97213", commune: "Le Lamentin", score: 78, demographie: 75, economie: 85, immobilier: 72, cadre_vie: 65 },
  { code_commune: "97233", commune: "Schœlcher", score: 81, demographie: 78, economie: 75, immobilier: 68, cadre_vie: 88 },
  { code_commune: "97229", commune: "Les Trois-Îlets", score: 85, demographie: 70, economie: 82, immobilier: 55, cadre_vie: 95 },
  { code_commune: "97227", commune: "Sainte-Anne", score: 74, demographie: 60, economie: 68, immobilier: 50, cadre_vie: 92 },
  { code_commune: "97231", commune: "Le Robert", score: 68, demographie: 72, economie: 65, immobilier: 70, cadre_vie: 60 },
  { code_commune: "97224", commune: "Ducos", score: 71, demographie: 78, economie: 70, immobilier: 75, cadre_vie: 55 },
  { code_commune: "97290", commune: "Le Marin", score: 76, demographie: 62, economie: 72, immobilier: 58, cadre_vie: 90 },
  { code_commune: "97250", commune: "Saint-Pierre", score: 52, demographie: 40, economie: 45, immobilier: 82, cadre_vie: 70 },
  { code_commune: "97228", commune: "Sainte-Luce", score: 79, demographie: 68, economie: 74, immobilier: 62, cadre_vie: 92 },
  { code_commune: "97223", commune: "Le Diamant", score: 73, demographie: 55, economie: 65, immobilier: 58, cadre_vie: 90 },
  { code_commune: "97240", commune: "Le François", score: 66, demographie: 68, economie: 62, immobilier: 68, cadre_vie: 58 },
  { code_commune: "97215", commune: "Rivière-Salée", score: 69, demographie: 72, economie: 68, immobilier: 72, cadre_vie: 58 },
  { code_commune: "97214", commune: "Gros-Morne", score: 48, demographie: 42, economie: 38, immobilier: 78, cadre_vie: 52 },
  { code_commune: "97212", commune: "Saint-Joseph", score: 58, demographie: 55, economie: 50, immobilier: 72, cadre_vie: 62 },
];

export function getDemoAttractiviteGeoJSON() {
  return {
    type: "FeatureCollection" as const,
    features: DEMO_ATTRACTIVITE.filter((a) => COMMUNE_POSITIONS[a.code_commune]).map((a) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: COMMUNE_POSITIONS[a.code_commune],
      },
      properties: {
        code_commune: a.code_commune,
        commune: a.commune,
        score: a.score,
        demographie: a.demographie,
        economie: a.economie,
        immobilier: a.immobilier,
        cadre_vie: a.cadre_vie,
      },
    })),
  };
}

// ── Risques GeoJSON ─────────────────────────────────────────────────────────

export function getDemoRisquesGeoJSON() {
  // Group by commune, compute max level
  const niveauOrder = { faible: 1, moyen: 2, fort: 3, tres_fort: 4 };
  const niveauColor = { faible: "#22c55e", moyen: "#eab308", fort: "#f97316", tres_fort: "#ef4444" };

  const byCommune = new Map<string, { code: string; commune: string; risques: typeof DEMO_RISQUES; maxNiveau: string }>();

  for (const r of DEMO_RISQUES) {
    if (!byCommune.has(r.code_commune)) {
      byCommune.set(r.code_commune, { code: r.code_commune, commune: r.commune, risques: [], maxNiveau: "faible" });
    }
    const entry = byCommune.get(r.code_commune)!;
    entry.risques.push(r);
    if (niveauOrder[r.niveau as keyof typeof niveauOrder] > niveauOrder[entry.maxNiveau as keyof typeof niveauOrder]) {
      entry.maxNiveau = r.niveau;
    }
  }

  return {
    type: "FeatureCollection" as const,
    features: Array.from(byCommune.values())
      .filter((c) => COMMUNE_POSITIONS[c.code])
      .map((c) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: COMMUNE_POSITIONS[c.code],
        },
        properties: {
          code_commune: c.code,
          commune: c.commune,
          niveau_max: c.maxNiveau,
          nb_risques: c.risques.length,
          types: c.risques.map((r) => r.type_risque).join(", "),
          color: niveauColor[c.maxNiveau as keyof typeof niveauColor] || "#94a3b8",
        },
      })),
  };
}
