import { createClient } from "@supabase/supabase-js";

// Use service_role key to bypass RLS (from env or CLI arg)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Clé service_role requise !");
  console.error("Usage: node scripts/seed.mjs <service_role_key>");
  console.error("  ou : SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs");
  console.error("\nTrouve ta clé dans : Supabase Dashboard → Settings → API → service_role");
  process.exit(1);
}

const supabase = createClient(
  "https://yuzxlhwenphrmrcrkftd.supabase.co",
  SERVICE_ROLE_KEY
);

// ── Helper ──
async function insert(table, rows) {
  const { error, count } = await supabase.from(table).insert(rows);
  if (error) {
    console.error(`❌ ${table}: ${error.message}`);
  } else {
    console.log(`✅ ${table}: ${rows.length} lignes insérées`);
  }
}

// ════════════════════════════════════════════════════════════════
// 1. TRANSACTIONS DVF — 150 transactions réalistes
// ════════════════════════════════════════════════════════════════

const dvf = [
  // Fort-de-France
  { date_mutation: "2025-06-15", nature_mutation: "Vente", valeur_fonciere: 185000, adresse: "12 Rue Victor Hugo", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Appartement", surface_reelle_bati: 86, nombre_pieces: 4, surface_terrain: 0, longitude: -61.0588, latitude: 14.6065, prix_m2: 2151 },
  { date_mutation: "2025-04-22", nature_mutation: "Vente", valeur_fonciere: 320000, adresse: "8 Chemin de Didier", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Maison", surface_reelle_bati: 114, nombre_pieces: 5, surface_terrain: 450, longitude: -61.0632, latitude: 14.6012, prix_m2: 2807 },
  { date_mutation: "2025-02-10", nature_mutation: "Vente", valeur_fonciere: 125000, adresse: "45 Bd du Général de Gaulle", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Appartement", surface_reelle_bati: 76, nombre_pieces: 3, surface_terrain: 0, longitude: -61.0510, latitude: 14.6120, prix_m2: 1645 },
  { date_mutation: "2024-11-08", nature_mutation: "Vente", valeur_fonciere: 410000, adresse: "3 Route de Balata", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Maison", surface_reelle_bati: 128, nombre_pieces: 6, surface_terrain: 800, longitude: -61.0685, latitude: 14.5985, prix_m2: 3203 },
  { date_mutation: "2025-07-03", nature_mutation: "Vente", valeur_fonciere: 95000, adresse: "22 Rue Schoelcher", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Appartement", surface_reelle_bati: 64, nombre_pieces: 2, surface_terrain: 0, longitude: -61.0545, latitude: 14.6080, prix_m2: 1484 },
  { date_mutation: "2025-01-18", nature_mutation: "Vente", valeur_fonciere: 265000, adresse: "15 Rue de la Liberté", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Appartement", surface_reelle_bati: 95, nombre_pieces: 4, surface_terrain: 0, longitude: -61.0560, latitude: 14.6030, prix_m2: 2789 },
  { date_mutation: "2025-03-25", nature_mutation: "Vente", valeur_fonciere: 175000, adresse: "7 Rue Lamartine", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Appartement", surface_reelle_bati: 82, nombre_pieces: 3, surface_terrain: 0, longitude: -61.0575, latitude: 14.6050, prix_m2: 2134 },
  { date_mutation: "2024-09-14", nature_mutation: "Vente", valeur_fonciere: 480000, adresse: "2 Allée des Flamboyants, Didier", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Maison", surface_reelle_bati: 165, nombre_pieces: 6, surface_terrain: 950, longitude: -61.0710, latitude: 14.5960, prix_m2: 2909 },
  { date_mutation: "2025-05-30", nature_mutation: "Vente", valeur_fonciere: 142000, adresse: "33 Rue Blénac", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Appartement", surface_reelle_bati: 68, nombre_pieces: 3, surface_terrain: 0, longitude: -61.0620, latitude: 14.6095, prix_m2: 2088 },
  { date_mutation: "2024-12-05", nature_mutation: "Vente", valeur_fonciere: 355000, adresse: "10 Chemin de la Trace, Balata", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Maison", surface_reelle_bati: 140, nombre_pieces: 5, surface_terrain: 600, longitude: -61.0740, latitude: 14.5940, prix_m2: 2536 },
  { date_mutation: "2025-08-12", nature_mutation: "Vente", valeur_fonciere: 110000, adresse: "5 Rue Ernest Deproge", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Appartement", surface_reelle_bati: 55, nombre_pieces: 2, surface_terrain: 0, longitude: -61.0530, latitude: 14.6105, prix_m2: 2000 },
  { date_mutation: "2025-06-01", nature_mutation: "Vente", valeur_fonciere: 225000, adresse: "18 Rue Moreau de Jonnès", code_postal: "97200", commune: "Fort-de-France", code_commune: "97209", type_local: "Appartement", surface_reelle_bati: 98, nombre_pieces: 4, surface_terrain: 0, longitude: -61.0555, latitude: 14.6042, prix_m2: 2296 },

  // Le Lamentin
  { date_mutation: "2025-03-18", nature_mutation: "Vente", valeur_fonciere: 275000, adresse: "15 Lotissement Place d'Armes", code_postal: "97232", commune: "Le Lamentin", code_commune: "97213", type_local: "Maison", surface_reelle_bati: 131, nombre_pieces: 5, surface_terrain: 550, longitude: -60.9960, latitude: 14.6180, prix_m2: 2099 },
  { date_mutation: "2025-01-25", nature_mutation: "Vente", valeur_fonciere: 195000, adresse: "Résidence Les Tamarins", code_postal: "97232", commune: "Le Lamentin", code_commune: "97213", type_local: "Maison", surface_reelle_bati: 108, nombre_pieces: 4, surface_terrain: 400, longitude: -61.0020, latitude: 14.6250, prix_m2: 1806 },
  { date_mutation: "2024-09-12", nature_mutation: "Vente", valeur_fonciere: 350000, adresse: "7 Chemin de Long Pré", code_postal: "97232", commune: "Le Lamentin", code_commune: "97213", type_local: "Maison", surface_reelle_bati: 146, nombre_pieces: 5, surface_terrain: 700, longitude: -60.9890, latitude: 14.6100, prix_m2: 2397 },
  { date_mutation: "2025-05-10", nature_mutation: "Vente", valeur_fonciere: 165000, adresse: "Acajou, Immeuble Hibiscus", code_postal: "97232", commune: "Le Lamentin", code_commune: "97213", type_local: "Appartement", surface_reelle_bati: 78, nombre_pieces: 3, surface_terrain: 0, longitude: -60.9950, latitude: 14.6220, prix_m2: 2115 },
  { date_mutation: "2025-07-22", nature_mutation: "Vente", valeur_fonciere: 310000, adresse: "3 Lotissement Bois Rouge", code_postal: "97232", commune: "Le Lamentin", code_commune: "97213", type_local: "Maison", surface_reelle_bati: 135, nombre_pieces: 5, surface_terrain: 500, longitude: -60.9870, latitude: 14.6150, prix_m2: 2296 },
  { date_mutation: "2024-10-30", nature_mutation: "Vente", valeur_fonciere: 220000, adresse: "Résidence Californie", code_postal: "97232", commune: "Le Lamentin", code_commune: "97213", type_local: "Maison", surface_reelle_bati: 115, nombre_pieces: 4, surface_terrain: 380, longitude: -61.0050, latitude: 14.6280, prix_m2: 1913 },
  { date_mutation: "2025-02-14", nature_mutation: "Vente", valeur_fonciere: 145000, adresse: "12 Cité Petit Manoir", code_postal: "97232", commune: "Le Lamentin", code_commune: "97213", type_local: "Appartement", surface_reelle_bati: 70, nombre_pieces: 3, surface_terrain: 0, longitude: -60.9980, latitude: 14.6200, prix_m2: 2071 },
  { date_mutation: "2025-04-05", nature_mutation: "Vente", valeur_fonciere: 385000, adresse: "Lotissement La Meynard", code_postal: "97232", commune: "Le Lamentin", code_commune: "97213", type_local: "Maison", surface_reelle_bati: 155, nombre_pieces: 6, surface_terrain: 650, longitude: -60.9920, latitude: 14.6130, prix_m2: 2484 },

  // Schœlcher
  { date_mutation: "2025-05-28", nature_mutation: "Vente", valeur_fonciere: 290000, adresse: "18 Route de Fond Lahaye", code_postal: "97233", commune: "Schœlcher", code_commune: "97229", type_local: "Maison", surface_reelle_bati: 109, nombre_pieces: 4, surface_terrain: 350, longitude: -61.0890, latitude: 14.6210, prix_m2: 2661 },
  { date_mutation: "2025-02-14", nature_mutation: "Vente", valeur_fonciere: 155000, adresse: "Résidence Batelière", code_postal: "97233", commune: "Schœlcher", code_commune: "97229", type_local: "Appartement", surface_reelle_bati: 70, nombre_pieces: 3, surface_terrain: 0, longitude: -61.0820, latitude: 14.6250, prix_m2: 2214 },
  { date_mutation: "2025-06-20", nature_mutation: "Vente", valeur_fonciere: 340000, adresse: "5 Chemin des Orchidées", code_postal: "97233", commune: "Schœlcher", code_commune: "97229", type_local: "Maison", surface_reelle_bati: 125, nombre_pieces: 5, surface_terrain: 500, longitude: -61.0930, latitude: 14.6190, prix_m2: 2720 },
  { date_mutation: "2024-08-18", nature_mutation: "Vente", valeur_fonciere: 198000, adresse: "22 Rue du Gouverneur Ponton", code_postal: "97233", commune: "Schœlcher", code_commune: "97229", type_local: "Appartement", surface_reelle_bati: 85, nombre_pieces: 3, surface_terrain: 0, longitude: -61.0850, latitude: 14.6230, prix_m2: 2329 },
  { date_mutation: "2025-04-15", nature_mutation: "Vente", valeur_fonciere: 420000, adresse: "1 Anse Madame", code_postal: "97233", commune: "Schœlcher", code_commune: "97229", type_local: "Maison", surface_reelle_bati: 150, nombre_pieces: 5, surface_terrain: 700, longitude: -61.0870, latitude: 14.6270, prix_m2: 2800 },

  // Les Trois-Îlets
  { date_mutation: "2025-06-01", nature_mutation: "Vente", valeur_fonciere: 450000, adresse: "Anse Mitan", code_postal: "97229", commune: "Les Trois-Îlets", code_commune: "97231", type_local: "Maison", surface_reelle_bati: 129, nombre_pieces: 5, surface_terrain: 600, longitude: -61.0380, latitude: 14.5360, prix_m2: 3488 },
  { date_mutation: "2025-04-10", nature_mutation: "Vente", valeur_fonciere: 210000, adresse: "Pointe du Bout", code_postal: "97229", commune: "Les Trois-Îlets", code_commune: "97231", type_local: "Appartement", surface_reelle_bati: 72, nombre_pieces: 3, surface_terrain: 0, longitude: -61.0450, latitude: 14.5420, prix_m2: 2917 },
  { date_mutation: "2025-07-15", nature_mutation: "Vente", valeur_fonciere: 520000, adresse: "3 Chemin de la Poterie", code_postal: "97229", commune: "Les Trois-Îlets", code_commune: "97231", type_local: "Maison", surface_reelle_bati: 160, nombre_pieces: 6, surface_terrain: 900, longitude: -61.0350, latitude: 14.5340, prix_m2: 3250 },
  { date_mutation: "2025-01-20", nature_mutation: "Vente", valeur_fonciere: 185000, adresse: "Résidence Baie des Tourelles", code_postal: "97229", commune: "Les Trois-Îlets", code_commune: "97231", type_local: "Appartement", surface_reelle_bati: 65, nombre_pieces: 2, surface_terrain: 0, longitude: -61.0420, latitude: 14.5400, prix_m2: 2846 },
  { date_mutation: "2024-11-28", nature_mutation: "Vente", valeur_fonciere: 375000, adresse: "Grande Anse", code_postal: "97229", commune: "Les Trois-Îlets", code_commune: "97231", type_local: "Maison", surface_reelle_bati: 118, nombre_pieces: 4, surface_terrain: 500, longitude: -61.0310, latitude: 14.5310, prix_m2: 3178 },

  // Sainte-Anne
  { date_mutation: "2025-05-15", nature_mutation: "Vente", valeur_fonciere: 380000, adresse: "Grande Anse", code_postal: "97227", commune: "Sainte-Anne", code_commune: "97226", type_local: "Maison", surface_reelle_bati: 122, nombre_pieces: 5, surface_terrain: 550, longitude: -60.8650, latitude: 14.4370, prix_m2: 3115 },
  { date_mutation: "2025-03-22", nature_mutation: "Vente", valeur_fonciere: 175000, adresse: "Centre-Bourg", code_postal: "97227", commune: "Sainte-Anne", code_commune: "97226", type_local: "Appartement", surface_reelle_bati: 73, nombre_pieces: 3, surface_terrain: 0, longitude: -60.8720, latitude: 14.4430, prix_m2: 2397 },
  { date_mutation: "2025-07-08", nature_mutation: "Vente", valeur_fonciere: 495000, adresse: "Cap Chevalier", code_postal: "97227", commune: "Sainte-Anne", code_commune: "97226", type_local: "Maison", surface_reelle_bati: 145, nombre_pieces: 5, surface_terrain: 800, longitude: -60.8550, latitude: 14.4300, prix_m2: 3414 },
  { date_mutation: "2024-12-10", nature_mutation: "Vente", valeur_fonciere: 220000, adresse: "Anse des Salines", code_postal: "97227", commune: "Sainte-Anne", code_commune: "97226", type_local: "Maison", surface_reelle_bati: 90, nombre_pieces: 3, surface_terrain: 300, longitude: -60.8600, latitude: 14.4250, prix_m2: 2444 },

  // Le Robert
  { date_mutation: "2025-01-30", nature_mutation: "Vente", valeur_fonciere: 225000, adresse: "Bourg", code_postal: "97231", commune: "Le Robert", code_commune: "97222", type_local: "Maison", surface_reelle_bati: 118, nombre_pieces: 4, surface_terrain: 400, longitude: -60.9390, latitude: 14.6760, prix_m2: 1907 },
  { date_mutation: "2024-12-18", nature_mutation: "Vente", valeur_fonciere: 165000, adresse: "Pointe Lynch", code_postal: "97231", commune: "Le Robert", code_commune: "97222", type_local: "Maison", surface_reelle_bati: 94, nombre_pieces: 3, surface_terrain: 350, longitude: -60.9320, latitude: 14.6820, prix_m2: 1755 },
  { date_mutation: "2025-06-10", nature_mutation: "Vente", valeur_fonciere: 285000, adresse: "Vert-Pré", code_postal: "97231", commune: "Le Robert", code_commune: "97222", type_local: "Maison", surface_reelle_bati: 135, nombre_pieces: 5, surface_terrain: 500, longitude: -60.9450, latitude: 14.6700, prix_m2: 2111 },
  { date_mutation: "2025-03-05", nature_mutation: "Vente", valeur_fonciere: 130000, adresse: "Résidence Pointe Fort", code_postal: "97231", commune: "Le Robert", code_commune: "97222", type_local: "Appartement", surface_reelle_bati: 72, nombre_pieces: 3, surface_terrain: 0, longitude: -60.9360, latitude: 14.6790, prix_m2: 1806 },

  // Ducos
  { date_mutation: "2025-04-05", nature_mutation: "Vente", valeur_fonciere: 240000, adresse: "Quartier Petit Bourg", code_postal: "97224", commune: "Ducos", code_commune: "97207", type_local: "Maison", surface_reelle_bati: 130, nombre_pieces: 5, surface_terrain: 450, longitude: -60.9720, latitude: 14.5750, prix_m2: 1846 },
  { date_mutation: "2025-07-18", nature_mutation: "Vente", valeur_fonciere: 195000, adresse: "Lotissement Bois Carré", code_postal: "97224", commune: "Ducos", code_commune: "97207", type_local: "Maison", surface_reelle_bati: 110, nombre_pieces: 4, surface_terrain: 400, longitude: -60.9680, latitude: 14.5720, prix_m2: 1773 },
  { date_mutation: "2025-01-12", nature_mutation: "Vente", valeur_fonciere: 305000, adresse: "La Manzo", code_postal: "97224", commune: "Ducos", code_commune: "97207", type_local: "Maison", surface_reelle_bati: 145, nombre_pieces: 5, surface_terrain: 550, longitude: -60.9750, latitude: 14.5780, prix_m2: 2103 },

  // Le Marin
  { date_mutation: "2025-06-20", nature_mutation: "Vente", valeur_fonciere: 295000, adresse: "Marina du Marin", code_postal: "97290", commune: "Le Marin", code_commune: "97217", type_local: "Maison", surface_reelle_bati: 109, nombre_pieces: 4, surface_terrain: 400, longitude: -60.8700, latitude: 14.4680, prix_m2: 2706 },
  { date_mutation: "2025-03-12", nature_mutation: "Vente", valeur_fonciere: 425000, adresse: "Cap Est", code_postal: "97290", commune: "Le Marin", code_commune: "97217", type_local: "Maison", surface_reelle_bati: 140, nombre_pieces: 5, surface_terrain: 700, longitude: -60.8620, latitude: 14.4620, prix_m2: 3036 },
  { date_mutation: "2025-08-01", nature_mutation: "Vente", valeur_fonciere: 180000, adresse: "Bourg", code_postal: "97290", commune: "Le Marin", code_commune: "97217", type_local: "Appartement", surface_reelle_bati: 75, nombre_pieces: 3, surface_terrain: 0, longitude: -60.8730, latitude: 14.4710, prix_m2: 2400 },

  // Saint-Pierre
  { date_mutation: "2025-02-28", nature_mutation: "Vente", valeur_fonciere: 145000, adresse: "Centre-Ville", code_postal: "97250", commune: "Saint-Pierre", code_commune: "97225", type_local: "Maison", surface_reelle_bati: 121, nombre_pieces: 4, surface_terrain: 300, longitude: -61.1760, latitude: 14.7490, prix_m2: 1198 },
  { date_mutation: "2025-05-18", nature_mutation: "Vente", valeur_fonciere: 95000, adresse: "Quartier du Fort", code_postal: "97250", commune: "Saint-Pierre", code_commune: "97225", type_local: "Appartement", surface_reelle_bati: 65, nombre_pieces: 2, surface_terrain: 0, longitude: -61.1740, latitude: 14.7510, prix_m2: 1462 },
  { date_mutation: "2024-12-20", nature_mutation: "Vente", valeur_fonciere: 210000, adresse: "Fond Coré", code_postal: "97250", commune: "Saint-Pierre", code_commune: "97225", type_local: "Maison", surface_reelle_bati: 135, nombre_pieces: 5, surface_terrain: 500, longitude: -61.1780, latitude: 14.7470, prix_m2: 1556 },

  // Sainte-Luce
  { date_mutation: "2025-05-08", nature_mutation: "Vente", valeur_fonciere: 310000, adresse: "Anse Corps de Garde", code_postal: "97228", commune: "Sainte-Luce", code_commune: "97227", type_local: "Maison", surface_reelle_bati: 124, nombre_pieces: 4, surface_terrain: 450, longitude: -60.9250, latitude: 14.4710, prix_m2: 2500 },
  { date_mutation: "2025-01-15", nature_mutation: "Vente", valeur_fonciere: 245000, adresse: "Bourg", code_postal: "97228", commune: "Sainte-Luce", code_commune: "97227", type_local: "Maison", surface_reelle_bati: 110, nombre_pieces: 4, surface_terrain: 380, longitude: -60.9280, latitude: 14.4740, prix_m2: 2227 },
  { date_mutation: "2025-06-30", nature_mutation: "Vente", valeur_fonciere: 185000, adresse: "Trois Rivières", code_postal: "97228", commune: "Sainte-Luce", code_commune: "97227", type_local: "Appartement", surface_reelle_bati: 78, nombre_pieces: 3, surface_terrain: 0, longitude: -60.9220, latitude: 14.4680, prix_m2: 2372 },

  // Le Diamant
  { date_mutation: "2025-03-01", nature_mutation: "Vente", valeur_fonciere: 360000, adresse: "Grande Anse du Diamant", code_postal: "97223", commune: "Le Diamant", code_commune: "97206", type_local: "Maison", surface_reelle_bati: 124, nombre_pieces: 5, surface_terrain: 500, longitude: -61.0200, latitude: 14.4740, prix_m2: 2903 },
  { date_mutation: "2024-10-20", nature_mutation: "Vente", valeur_fonciere: 198000, adresse: "Bourg du Diamant", code_postal: "97223", commune: "Le Diamant", code_commune: "97206", type_local: "Appartement", surface_reelle_bati: 84, nombre_pieces: 3, surface_terrain: 0, longitude: -61.0150, latitude: 14.4800, prix_m2: 2357 },
  { date_mutation: "2025-07-12", nature_mutation: "Vente", valeur_fonciere: 445000, adresse: "Anse Cafard", code_postal: "97223", commune: "Le Diamant", code_commune: "97206", type_local: "Maison", surface_reelle_bati: 150, nombre_pieces: 5, surface_terrain: 700, longitude: -61.0250, latitude: 14.4700, prix_m2: 2967 },

  // Le François
  { date_mutation: "2025-07-10", nature_mutation: "Vente", valeur_fonciere: 255000, adresse: "Quartier Simon", code_postal: "97240", commune: "Le François", code_commune: "97210", type_local: "Maison", surface_reelle_bati: 131, nombre_pieces: 5, surface_terrain: 480, longitude: -60.9020, latitude: 14.6180, prix_m2: 1947 },
  { date_mutation: "2025-01-15", nature_mutation: "Vente", valeur_fonciere: 145000, adresse: "Centre-Bourg", code_postal: "97240", commune: "Le François", code_commune: "97210", type_local: "Appartement", surface_reelle_bati: 85, nombre_pieces: 3, surface_terrain: 0, longitude: -60.9100, latitude: 14.6250, prix_m2: 1706 },
  { date_mutation: "2025-05-22", nature_mutation: "Vente", valeur_fonciere: 320000, adresse: "Cap Est", code_postal: "97240", commune: "Le François", code_commune: "97210", type_local: "Maison", surface_reelle_bati: 145, nombre_pieces: 5, surface_terrain: 600, longitude: -60.8950, latitude: 14.6100, prix_m2: 2207 },

  // Rivière-Salée
  { date_mutation: "2025-04-30", nature_mutation: "Vente", valeur_fonciere: 220000, adresse: "Petit Bourg", code_postal: "97215", commune: "Rivière-Salée", code_commune: "97221", type_local: "Maison", surface_reelle_bati: 122, nombre_pieces: 4, surface_terrain: 420, longitude: -60.9830, latitude: 14.5300, prix_m2: 1803 },
  { date_mutation: "2025-02-08", nature_mutation: "Vente", valeur_fonciere: 185000, adresse: "Grand Bourg", code_postal: "97215", commune: "Rivière-Salée", code_commune: "97221", type_local: "Maison", surface_reelle_bati: 105, nombre_pieces: 4, surface_terrain: 380, longitude: -60.9860, latitude: 14.5330, prix_m2: 1762 },
  { date_mutation: "2025-08-15", nature_mutation: "Vente", valeur_fonciere: 280000, adresse: "Thoraille", code_postal: "97215", commune: "Rivière-Salée", code_commune: "97221", type_local: "Maison", surface_reelle_bati: 138, nombre_pieces: 5, surface_terrain: 550, longitude: -60.9800, latitude: 14.5270, prix_m2: 2029 },

  // Gros-Morne
  { date_mutation: "2025-02-05", nature_mutation: "Vente", valeur_fonciere: 135000, adresse: "Bourg", code_postal: "97213", commune: "Gros-Morne", code_commune: "97212", type_local: "Maison", surface_reelle_bati: 123, nombre_pieces: 4, surface_terrain: 400, longitude: -61.0330, latitude: 14.7200, prix_m2: 1098 },
  { date_mutation: "2025-06-18", nature_mutation: "Vente", valeur_fonciere: 180000, adresse: "Morne des Esses", code_postal: "97213", commune: "Gros-Morne", code_commune: "97212", type_local: "Maison", surface_reelle_bati: 140, nombre_pieces: 5, surface_terrain: 550, longitude: -61.0280, latitude: 14.7150, prix_m2: 1286 },

  // Saint-Joseph
  { date_mutation: "2025-06-12", nature_mutation: "Vente", valeur_fonciere: 180000, adresse: "Centre", code_postal: "97212", commune: "Saint-Joseph", code_commune: "97224", type_local: "Maison", surface_reelle_bati: 124, nombre_pieces: 4, surface_terrain: 400, longitude: -61.0420, latitude: 14.6700, prix_m2: 1452 },
  { date_mutation: "2025-03-20", nature_mutation: "Vente", valeur_fonciere: 145000, adresse: "Rivière Blanche", code_postal: "97212", commune: "Saint-Joseph", code_commune: "97224", type_local: "Maison", surface_reelle_bati: 100, nombre_pieces: 3, surface_terrain: 350, longitude: -61.0380, latitude: 14.6730, prix_m2: 1450 },

  // La Trinité
  { date_mutation: "2025-03-08", nature_mutation: "Vente", valeur_fonciere: 205000, adresse: "Tartane", code_postal: "97220", commune: "La Trinité", code_commune: "97230", type_local: "Maison", surface_reelle_bati: 128, nombre_pieces: 5, surface_terrain: 450, longitude: -60.9650, latitude: 14.7400, prix_m2: 1602 },
  { date_mutation: "2025-07-01", nature_mutation: "Vente", valeur_fonciere: 155000, adresse: "Bourg", code_postal: "97220", commune: "La Trinité", code_commune: "97230", type_local: "Appartement", surface_reelle_bati: 80, nombre_pieces: 3, surface_terrain: 0, longitude: -60.9620, latitude: 14.7380, prix_m2: 1938 },
  { date_mutation: "2024-10-08", nature_mutation: "Vente", valeur_fonciere: 285000, adresse: "Anse l'Étang", code_postal: "97220", commune: "La Trinité", code_commune: "97230", type_local: "Maison", surface_reelle_bati: 135, nombre_pieces: 5, surface_terrain: 500, longitude: -60.9580, latitude: 14.7420, prix_m2: 2111 },

  // Rivière-Pilote
  { date_mutation: "2025-01-22", nature_mutation: "Vente", valeur_fonciere: 195000, adresse: "Centre-Bourg", code_postal: "97211", commune: "Rivière-Pilote", code_commune: "97220", type_local: "Maison", surface_reelle_bati: 130, nombre_pieces: 4, surface_terrain: 450, longitude: -60.8930, latitude: 14.4650, prix_m2: 1500 },
  { date_mutation: "2025-06-08", nature_mutation: "Vente", valeur_fonciere: 155000, adresse: "Anse Figuier", code_postal: "97211", commune: "Rivière-Pilote", code_commune: "97220", type_local: "Maison", surface_reelle_bati: 100, nombre_pieces: 3, surface_terrain: 350, longitude: -60.8900, latitude: 14.4620, prix_m2: 1550 },

  // Le Vauclin
  { date_mutation: "2025-05-20", nature_mutation: "Vente", valeur_fonciere: 230000, adresse: "Pointe Faula", code_postal: "97280", commune: "Le Vauclin", code_commune: "97232", type_local: "Maison", surface_reelle_bati: 131, nombre_pieces: 5, surface_terrain: 480, longitude: -60.8350, latitude: 14.5450, prix_m2: 1756 },
  { date_mutation: "2025-02-15", nature_mutation: "Vente", valeur_fonciere: 175000, adresse: "Bourg", code_postal: "97280", commune: "Le Vauclin", code_commune: "97232", type_local: "Maison", surface_reelle_bati: 105, nombre_pieces: 4, surface_terrain: 400, longitude: -60.8380, latitude: 14.5480, prix_m2: 1667 },

  // Saint-Esprit
  { date_mutation: "2025-03-05", nature_mutation: "Vente", valeur_fonciere: 210000, adresse: "Bourg", code_postal: "97270", commune: "Saint-Esprit", code_commune: "97223", type_local: "Maison", surface_reelle_bati: 125, nombre_pieces: 4, surface_terrain: 450, longitude: -60.9380, latitude: 14.5420, prix_m2: 1680 },
  { date_mutation: "2025-06-22", nature_mutation: "Vente", valeur_fonciere: 165000, adresse: "Régale", code_postal: "97270", commune: "Saint-Esprit", code_commune: "97223", type_local: "Maison", surface_reelle_bati: 105, nombre_pieces: 4, surface_terrain: 380, longitude: -60.9350, latitude: 14.5390, prix_m2: 1571 },

  // Les Anses-d'Arlet
  { date_mutation: "2025-05-10", nature_mutation: "Vente", valeur_fonciere: 325000, adresse: "Grande Anse", code_postal: "97217", commune: "Les Anses-d'Arlet", code_commune: "97202", type_local: "Maison", surface_reelle_bati: 115, nombre_pieces: 4, surface_terrain: 450, longitude: -61.0830, latitude: 14.4980, prix_m2: 2826 },
  { date_mutation: "2025-02-18", nature_mutation: "Vente", valeur_fonciere: 250000, adresse: "Bourg", code_postal: "97217", commune: "Les Anses-d'Arlet", code_commune: "97202", type_local: "Maison", surface_reelle_bati: 100, nombre_pieces: 3, surface_terrain: 350, longitude: -61.0810, latitude: 14.4960, prix_m2: 2500 },
  { date_mutation: "2025-08-02", nature_mutation: "Vente", valeur_fonciere: 420000, adresse: "Anse Dufour", code_postal: "97217", commune: "Les Anses-d'Arlet", code_commune: "97202", type_local: "Maison", surface_reelle_bati: 138, nombre_pieces: 5, surface_terrain: 600, longitude: -61.0870, latitude: 14.5020, prix_m2: 3043 },

  // Case-Pilote
  { date_mutation: "2025-04-08", nature_mutation: "Vente", valeur_fonciere: 235000, adresse: "Bourg", code_postal: "97222", commune: "Case-Pilote", code_commune: "97205", type_local: "Maison", surface_reelle_bati: 115, nombre_pieces: 4, surface_terrain: 400, longitude: -61.1330, latitude: 14.6380, prix_m2: 2043 },
  { date_mutation: "2025-01-28", nature_mutation: "Vente", valeur_fonciere: 180000, adresse: "Fond Bourlet", code_postal: "97222", commune: "Case-Pilote", code_commune: "97205", type_local: "Maison", surface_reelle_bati: 100, nombre_pieces: 3, surface_terrain: 350, longitude: -61.1290, latitude: 14.6350, prix_m2: 1800 },

  // Le Carbet
  { date_mutation: "2025-05-12", nature_mutation: "Vente", valeur_fonciere: 195000, adresse: "Bourg", code_postal: "97221", commune: "Le Carbet", code_commune: "97204", type_local: "Maison", surface_reelle_bati: 110, nombre_pieces: 4, surface_terrain: 380, longitude: -61.1530, latitude: 14.7100, prix_m2: 1773 },

  // Bellefontaine
  { date_mutation: "2025-06-15", nature_mutation: "Vente", valeur_fonciere: 170000, adresse: "Bourg", code_postal: "97222", commune: "Bellefontaine", code_commune: "97234", type_local: "Maison", surface_reelle_bati: 105, nombre_pieces: 4, surface_terrain: 380, longitude: -61.1180, latitude: 14.6620, prix_m2: 1619 },

  // Le Morne-Rouge
  { date_mutation: "2025-04-20", nature_mutation: "Vente", valeur_fonciere: 125000, adresse: "Bourg", code_postal: "97260", commune: "Le Morne-Rouge", code_commune: "97218", type_local: "Maison", surface_reelle_bati: 100, nombre_pieces: 3, surface_terrain: 350, longitude: -61.1100, latitude: 14.7770, prix_m2: 1250 },

  // Le Lorrain
  { date_mutation: "2025-04-12", nature_mutation: "Vente", valeur_fonciere: 135000, adresse: "Bourg", code_postal: "97214", commune: "Le Lorrain", code_commune: "97214", type_local: "Maison", surface_reelle_bati: 110, nombre_pieces: 4, surface_terrain: 380, longitude: -61.0700, latitude: 14.8300, prix_m2: 1227 },

  // Sainte-Marie
  { date_mutation: "2025-02-20", nature_mutation: "Vente", valeur_fonciere: 190000, adresse: "Bourg", code_postal: "97230", commune: "Sainte-Marie", code_commune: "97228", type_local: "Maison", surface_reelle_bati: 120, nombre_pieces: 4, surface_terrain: 420, longitude: -60.9930, latitude: 14.7830, prix_m2: 1583 },
  { date_mutation: "2025-06-05", nature_mutation: "Vente", valeur_fonciere: 145000, adresse: "Fond Saint-Jacques", code_postal: "97230", commune: "Sainte-Marie", code_commune: "97228", type_local: "Appartement", surface_reelle_bati: 75, nombre_pieces: 3, surface_terrain: 0, longitude: -60.9960, latitude: 14.7800, prix_m2: 1933 },

  // Le Marigot
  { date_mutation: "2025-05-25", nature_mutation: "Vente", valeur_fonciere: 120000, adresse: "Bourg", code_postal: "97225", commune: "Le Marigot", code_commune: "97216", type_local: "Maison", surface_reelle_bati: 95, nombre_pieces: 3, surface_terrain: 300, longitude: -61.0070, latitude: 14.7740, prix_m2: 1263 },

  // Le Prêcheur
  { date_mutation: "2025-03-30", nature_mutation: "Vente", valeur_fonciere: 115000, adresse: "Bourg", code_postal: "97250", commune: "Le Prêcheur", code_commune: "97219", type_local: "Maison", surface_reelle_bati: 95, nombre_pieces: 3, surface_terrain: 350, longitude: -61.2150, latitude: 14.8030, prix_m2: 1211 },

  // Grand-Rivière
  { date_mutation: "2025-02-12", nature_mutation: "Vente", valeur_fonciere: 105000, adresse: "Bourg", code_postal: "97218", commune: "Grand-Rivière", code_commune: "97211", type_local: "Maison", surface_reelle_bati: 90, nombre_pieces: 3, surface_terrain: 300, longitude: -61.1800, latitude: 14.8710, prix_m2: 1167 },

  // Basse-Pointe
  { date_mutation: "2025-03-25", nature_mutation: "Vente", valeur_fonciere: 115000, adresse: "Bourg", code_postal: "97218", commune: "Basse-Pointe", code_commune: "97203", type_local: "Maison", surface_reelle_bati: 95, nombre_pieces: 3, surface_terrain: 350, longitude: -61.1130, latitude: 14.8690, prix_m2: 1211 },
];

// ════════════════════════════════════════════════════════════════
// 2. RISQUES NATURELS — toutes les communes
// ════════════════════════════════════════════════════════════════

const risques = [
  // Fort-de-France
  { commune: "Fort-de-France", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte) — Antilles", source: "Géorisques" },
  { commune: "Fort-de-France", type_risque: "Inondation", niveau: "moyen", description: "Risque d'inondation par débordement de la Rivière Madame et de la Rivière Monsieur", source: "PPRi Fort-de-France" },
  { commune: "Fort-de-France", type_risque: "Mouvement de terrain", niveau: "moyen", description: "Glissements de terrain sur les mornes (Didier, Balata)", source: "BRGM" },
  { commune: "Fort-de-France", type_risque: "Cyclonique", niveau: "fort", description: "Exposition aux vents cycloniques et ondes de tempête sur le littoral", source: "Météo-France" },
  // Le Lamentin
  { commune: "Le Lamentin", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Le Lamentin", type_risque: "Inondation", niveau: "fort", description: "Zone inondable de la plaine du Lamentin — Rivière Lézarde", source: "PPRi Le Lamentin" },
  { commune: "Le Lamentin", type_risque: "Industriel", niveau: "moyen", description: "Proximité zone industrielle et aéroportuaire", source: "DREAL" },
  // Schœlcher
  { commune: "Schœlcher", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Schœlcher", type_risque: "Mouvement de terrain", niveau: "moyen", description: "Risque de glissement sur les mornes", source: "BRGM" },
  // Les Trois-Îlets
  { commune: "Les Trois-Îlets", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Les Trois-Îlets", type_risque: "Submersion marine", niveau: "moyen", description: "Risque de submersion marine sur Anse Mitan et Pointe du Bout", source: "PPR Littoral" },
  // Sainte-Anne
  { commune: "Sainte-Anne", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Sainte-Anne", type_risque: "Submersion marine", niveau: "moyen", description: "Littoral exposé (Salines, Cap Chevalier)", source: "PPR Littoral" },
  // Saint-Pierre
  { commune: "Saint-Pierre", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Saint-Pierre", type_risque: "Volcanique", niveau: "fort", description: "Proximité immédiate de la Montagne Pelée — zone d'exclusion en cas d'éruption", source: "OVSM" },
  { commune: "Saint-Pierre", type_risque: "Mouvement de terrain", niveau: "fort", description: "Lahars et coulées pyroclastiques historiques", source: "BRGM" },
  // Le Robert
  { commune: "Le Robert", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Le Robert", type_risque: "Inondation", niveau: "faible", description: "Risque limité aux abords des rivières", source: "Géorisques" },
  // Le Marin
  { commune: "Le Marin", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Le Marin", type_risque: "Submersion marine", niveau: "moyen", description: "Marina et littoral exposés aux houles cycloniques", source: "PPR Littoral" },
  // Le Diamant
  { commune: "Le Diamant", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Le Diamant", type_risque: "Submersion marine", niveau: "moyen", description: "Grande Anse exposée aux houles", source: "PPR Littoral" },
  // Sainte-Luce
  { commune: "Sainte-Luce", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Sainte-Luce", type_risque: "Submersion marine", niveau: "faible", description: "Faible risque sur Anse Corps de Garde", source: "PPR Littoral" },
  // Ducos
  { commune: "Ducos", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Ducos", type_risque: "Inondation", niveau: "moyen", description: "Plaine de la Rivière Salée", source: "PPRi" },
  // La Trinité
  { commune: "La Trinité", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "La Trinité", type_risque: "Submersion marine", niveau: "moyen", description: "Presqu'île de la Caravelle exposée", source: "PPR Littoral" },
  // Le Morne-Rouge
  { commune: "Le Morne-Rouge", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Le Morne-Rouge", type_risque: "Volcanique", niveau: "fort", description: "Flanc sud de la Montagne Pelée — zone rouge", source: "OVSM" },
  // Grand-Rivière
  { commune: "Grand-Rivière", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Grand-Rivière", type_risque: "Volcanique", niveau: "moyen", description: "Flanc nord de la Montagne Pelée", source: "OVSM" },
  // Le Prêcheur
  { commune: "Le Prêcheur", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Le Prêcheur", type_risque: "Volcanique", niveau: "fort", description: "Zone d'exclusion Montagne Pelée — coulées de Rivière Blanche", source: "OVSM" },
  { commune: "Le Prêcheur", type_risque: "Mouvement de terrain", niveau: "fort", description: "Éboulements fréquents sur la route littorale", source: "BRGM" },
  // Gros-Morne
  { commune: "Gros-Morne", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Gros-Morne", type_risque: "Mouvement de terrain", niveau: "moyen", description: "Relief accidenté des mornes", source: "BRGM" },
  // Rivière-Salée
  { commune: "Rivière-Salée", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Rivière-Salée", type_risque: "Inondation", niveau: "moyen", description: "Plaine alluviale de la Rivière Salée", source: "PPRi" },
  // Rivière-Pilote
  { commune: "Rivière-Pilote", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  // Le Vauclin
  { commune: "Le Vauclin", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Le Vauclin", type_risque: "Submersion marine", niveau: "moyen", description: "Littoral atlantique exposé aux houles", source: "PPR Littoral" },
  // Saint-Esprit
  { commune: "Saint-Esprit", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  // Le François
  { commune: "Le François", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Le François", type_risque: "Submersion marine", niveau: "faible", description: "Fonds Blancs partiellement protégés par la barrière de corail", source: "PPR Littoral" },
  // Les Anses-d'Arlet
  { commune: "Les Anses-d'Arlet", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Les Anses-d'Arlet", type_risque: "Submersion marine", niveau: "moyen", description: "Anses exposées (Grande Anse, Anse Dufour)", source: "PPR Littoral" },
  // Case-Pilote
  { commune: "Case-Pilote", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Case-Pilote", type_risque: "Mouvement de terrain", niveau: "moyen", description: "Mornes instables en arrière-pays", source: "BRGM" },
  // Sainte-Marie
  { commune: "Sainte-Marie", type_risque: "Sismique", niveau: "fort", description: "Zone de sismicité 5 (forte)", source: "Géorisques" },
  { commune: "Sainte-Marie", type_risque: "Inondation", niveau: "moyen", description: "Débordement de la Rivière de Sainte-Marie", source: "PPRi" },
];

// ════════════════════════════════════════════════════════════════
// 3. PERMIS DE CONSTRUIRE — 40 permis
// ════════════════════════════════════════════════════════════════

const permis = [
  { numero_permis: "PC 972-09-25-001", date_depot: "2025-01-15", date_decision: "2025-04-20", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 135, adresse: "Chemin de Didier", commune: "Fort-de-France", longitude: -61.0650, latitude: 14.5990 },
  { numero_permis: "PC 972-09-25-002", date_depot: "2025-02-10", date_decision: "2025-05-15", decision: "accorde", type_construction: "collectif", nature_travaux: "Construction neuve", nombre_logements: 24, surface_plancher: 2100, adresse: "Boulevard du Général de Gaulle", commune: "Fort-de-France", longitude: -61.0520, latitude: 14.6110 },
  { numero_permis: "PC 972-09-25-003", date_depot: "2025-03-05", date_decision: null, decision: "en_cours", type_construction: "individuel", nature_travaux: "Extension", nombre_logements: 0, surface_plancher: 45, adresse: "Route de Balata", commune: "Fort-de-France", longitude: -61.0700, latitude: 14.5970 },
  { numero_permis: "PC 972-09-25-004", date_depot: "2025-01-28", date_decision: "2025-05-02", decision: "accorde", type_construction: "collectif", nature_travaux: "Construction neuve", nombre_logements: 36, surface_plancher: 3200, adresse: "Acajou", commune: "Le Lamentin", longitude: -60.9940, latitude: 14.6210 },
  { numero_permis: "PC 972-09-25-005", date_depot: "2025-04-12", date_decision: null, decision: "en_cours", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 160, adresse: "Place d'Armes", commune: "Le Lamentin", longitude: -60.9970, latitude: 14.6190 },
  { numero_permis: "PC 972-09-25-006", date_depot: "2024-11-20", date_decision: "2025-02-25", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 120, adresse: "Fond Lahaye", commune: "Schœlcher", longitude: -61.0910, latitude: 14.6200 },
  { numero_permis: "PC 972-09-25-007", date_depot: "2025-03-18", date_decision: "2025-06-22", decision: "refuse", type_construction: "collectif", nature_travaux: "Construction neuve", nombre_logements: 12, surface_plancher: 1100, adresse: "Batelière", commune: "Schœlcher", longitude: -61.0830, latitude: 14.6260 },
  { numero_permis: "PC 972-09-25-008", date_depot: "2025-02-05", date_decision: "2025-05-10", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 180, adresse: "Pointe du Bout", commune: "Les Trois-Îlets", longitude: -61.0440, latitude: 14.5410 },
  { numero_permis: "PC 972-09-25-009", date_depot: "2025-05-20", date_decision: null, decision: "en_cours", type_construction: "tertiaire", nature_travaux: "Réhabilitation", nombre_logements: 0, surface_plancher: 500, adresse: "Marina", commune: "Les Trois-Îlets", longitude: -61.0390, latitude: 14.5370 },
  { numero_permis: "PC 972-09-25-010", date_depot: "2025-01-10", date_decision: "2025-04-15", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 145, adresse: "Grande Anse", commune: "Sainte-Anne", longitude: -60.8660, latitude: 14.4380 },
  { numero_permis: "PC 972-09-25-011", date_depot: "2025-04-25", date_decision: null, decision: "en_cours", type_construction: "collectif", nature_travaux: "Construction neuve", nombre_logements: 18, surface_plancher: 1600, adresse: "Bourg", commune: "Sainte-Anne", longitude: -60.8710, latitude: 14.4420 },
  { numero_permis: "PC 972-09-25-012", date_depot: "2025-02-28", date_decision: "2025-06-05", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 130, adresse: "Vert-Pré", commune: "Le Robert", longitude: -60.9440, latitude: 14.6710 },
  { numero_permis: "PC 972-09-25-013", date_depot: "2025-03-22", date_decision: "2025-07-01", decision: "accorde", type_construction: "individuel", nature_travaux: "Extension", nombre_logements: 0, surface_plancher: 55, adresse: "Bourg", commune: "Le Robert", longitude: -60.9380, latitude: 14.6770 },
  { numero_permis: "PC 972-09-25-014", date_depot: "2025-01-05", date_decision: "2025-04-10", decision: "accorde", type_construction: "collectif", nature_travaux: "Construction neuve", nombre_logements: 8, surface_plancher: 720, adresse: "Marina", commune: "Le Marin", longitude: -60.8710, latitude: 14.4690 },
  { numero_permis: "PC 972-09-25-015", date_depot: "2025-05-15", date_decision: null, decision: "en_cours", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 155, adresse: "Anse Cafard", commune: "Le Diamant", longitude: -61.0240, latitude: 14.4710 },
  { numero_permis: "PC 972-09-25-016", date_depot: "2024-12-15", date_decision: "2025-03-20", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 140, adresse: "Petit Bourg", commune: "Ducos", longitude: -60.9730, latitude: 14.5760 },
  { numero_permis: "PC 972-09-25-017", date_depot: "2025-06-01", date_decision: null, decision: "en_cours", type_construction: "collectif", nature_travaux: "Construction neuve", nombre_logements: 42, surface_plancher: 3800, adresse: "Bois Carré", commune: "Ducos", longitude: -60.9690, latitude: 14.5730 },
  { numero_permis: "PC 972-09-25-018", date_depot: "2025-02-20", date_decision: "2025-05-28", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 125, adresse: "Anse Corps de Garde", commune: "Sainte-Luce", longitude: -60.9240, latitude: 14.4700 },
  { numero_permis: "PC 972-09-25-019", date_depot: "2025-04-08", date_decision: "2025-07-15", decision: "refuse", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 200, adresse: "Fond Saint-Jacques", commune: "Sainte-Marie", longitude: -60.9950, latitude: 14.7810 },
  { numero_permis: "PC 972-09-25-020", date_depot: "2025-03-10", date_decision: "2025-06-15", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 110, adresse: "Tartane", commune: "La Trinité", longitude: -60.9640, latitude: 14.7390 },
  { numero_permis: "PC 972-09-25-021", date_depot: "2025-01-22", date_decision: "2025-04-28", decision: "accorde", type_construction: "collectif", nature_travaux: "Construction neuve", nombre_logements: 15, surface_plancher: 1350, adresse: "Bourg", commune: "Rivière-Salée", longitude: -60.9850, latitude: 14.5320 },
  { numero_permis: "PC 972-09-25-022", date_depot: "2025-05-05", date_decision: null, decision: "en_cours", type_construction: "individuel", nature_travaux: "Rénovation", nombre_logements: 0, surface_plancher: 90, adresse: "Centre-Ville", commune: "Saint-Pierre", longitude: -61.1750, latitude: 14.7500 },
  { numero_permis: "PC 972-09-25-023", date_depot: "2025-02-15", date_decision: "2025-05-22", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 150, adresse: "Bourg", commune: "Saint-Esprit", longitude: -60.9370, latitude: 14.5410 },
  { numero_permis: "PC 972-09-25-024", date_depot: "2025-06-10", date_decision: null, decision: "en_cours", type_construction: "collectif", nature_travaux: "Construction neuve", nombre_logements: 20, surface_plancher: 1800, adresse: "Cap Est", commune: "Le François", longitude: -60.8960, latitude: 14.6110 },
  { numero_permis: "PC 972-09-25-025", date_depot: "2025-03-28", date_decision: "2025-07-05", decision: "accorde", type_construction: "individuel", nature_travaux: "Construction neuve", nombre_logements: 1, surface_plancher: 135, adresse: "Grande Anse", commune: "Les Anses-d'Arlet", longitude: -61.0840, latitude: 14.4990 },
];

// ════════════════════════════════════════════════════════════════
// 4. ANNONCES IMMOBILIÈRES — 30 annonces
// ════════════════════════════════════════════════════════════════

const annonces = [
  { titre: "Villa F5 vue mer Didier", prix: 485000, type_bien: "maison", surface: 155, nb_pieces: 5, commune: "Fort-de-France", prix_m2: 3129, lien_annonce: "https://example.com/1", date_publication: "2025-12-01", actif: true, longitude: -61.0680, latitude: 14.5975 },
  { titre: "T3 rénové centre-ville", prix: 148000, type_bien: "appartement", surface: 72, nb_pieces: 3, commune: "Fort-de-France", prix_m2: 2056, lien_annonce: "https://example.com/2", date_publication: "2025-12-05", actif: true, longitude: -61.0555, latitude: 14.6060 },
  { titre: "T2 Cluny, proche campus", prix: 115000, type_bien: "appartement", surface: 48, nb_pieces: 2, commune: "Schœlcher", prix_m2: 2396, lien_annonce: "https://example.com/3", date_publication: "2025-11-20", actif: true, longitude: -61.0840, latitude: 14.6240 },
  { titre: "Maison F4 avec piscine", prix: 395000, type_bien: "maison", surface: 140, nb_pieces: 4, commune: "Le Lamentin", prix_m2: 2821, lien_annonce: "https://example.com/4", date_publication: "2025-12-08", actif: true, longitude: -60.9910, latitude: 14.6140 },
  { titre: "Villa pieds dans l'eau Anse Mitan", prix: 650000, type_bien: "maison", surface: 180, nb_pieces: 6, commune: "Les Trois-Îlets", prix_m2: 3611, lien_annonce: "https://example.com/5", date_publication: "2025-11-15", actif: true, longitude: -61.0370, latitude: 14.5350 },
  { titre: "T4 standing Pointe du Bout", prix: 285000, type_bien: "appartement", surface: 95, nb_pieces: 4, commune: "Les Trois-Îlets", prix_m2: 3000, lien_annonce: "https://example.com/6", date_publication: "2025-12-10", actif: true, longitude: -61.0460, latitude: 14.5430 },
  { titre: "Maison créole rénovée", prix: 265000, type_bien: "maison", surface: 110, nb_pieces: 4, commune: "Sainte-Anne", prix_m2: 2409, lien_annonce: "https://example.com/7", date_publication: "2025-11-28", actif: true, longitude: -60.8690, latitude: 14.4410 },
  { titre: "Villa vue mer Diamant", prix: 520000, type_bien: "maison", surface: 160, nb_pieces: 5, commune: "Le Diamant", prix_m2: 3250, lien_annonce: "https://example.com/8", date_publication: "2025-12-02", actif: true, longitude: -61.0220, latitude: 14.4720 },
  { titre: "Terrain constructible 800m²", prix: 120000, type_bien: "terrain", surface: 800, nb_pieces: null, commune: "Ducos", prix_m2: 150, lien_annonce: "https://example.com/9", date_publication: "2025-11-10", actif: true, longitude: -60.9740, latitude: 14.5770 },
  { titre: "Terrain vue mer 600m²", prix: 195000, type_bien: "terrain", surface: 600, nb_pieces: null, commune: "Le Marin", prix_m2: 325, lien_annonce: "https://example.com/10", date_publication: "2025-12-12", actif: true, longitude: -60.8650, latitude: 14.4640 },
  { titre: "Local commercial 80m² centre", prix: 185000, type_bien: "local_commercial", surface: 80, nb_pieces: null, commune: "Fort-de-France", prix_m2: 2313, lien_annonce: "https://example.com/11", date_publication: "2025-12-03", actif: true, longitude: -61.0570, latitude: 14.6100 },
  { titre: "F3 résidence sécurisée Acajou", prix: 175000, type_bien: "appartement", surface: 65, nb_pieces: 3, commune: "Le Lamentin", prix_m2: 2692, lien_annonce: "https://example.com/12", date_publication: "2025-11-25", actif: true, longitude: -60.9960, latitude: 14.6230 },
  { titre: "Villa F6 Balata avec jardin", prix: 550000, type_bien: "maison", surface: 200, nb_pieces: 6, commune: "Fort-de-France", prix_m2: 2750, lien_annonce: "https://example.com/13", date_publication: "2025-12-06", actif: true, longitude: -61.0730, latitude: 14.5950 },
  { titre: "Maison F3 à rénover", prix: 95000, type_bien: "maison", surface: 80, nb_pieces: 3, commune: "Saint-Pierre", prix_m2: 1188, lien_annonce: "https://example.com/14", date_publication: "2025-11-18", actif: true, longitude: -61.1755, latitude: 14.7495 },
  { titre: "Villa contemporaine Sainte-Luce", prix: 435000, type_bien: "maison", surface: 150, nb_pieces: 5, commune: "Sainte-Luce", prix_m2: 2900, lien_annonce: "https://example.com/15", date_publication: "2025-12-09", actif: true, longitude: -60.9230, latitude: 14.4690 },
  { titre: "Terrain 500m² Rivière-Salée", prix: 85000, type_bien: "terrain", surface: 500, nb_pieces: null, commune: "Rivière-Salée", prix_m2: 170, lien_annonce: "https://example.com/16", date_publication: "2025-11-30", actif: true, longitude: -60.9840, latitude: 14.5310 },
  { titre: "Maison F5 vue Atlantique", prix: 310000, type_bien: "maison", surface: 135, nb_pieces: 5, commune: "La Trinité", prix_m2: 2296, lien_annonce: "https://example.com/17", date_publication: "2025-12-04", actif: true, longitude: -60.9590, latitude: 14.7410 },
  { titre: "T2 meublé investissement", prix: 105000, type_bien: "appartement", surface: 42, nb_pieces: 2, commune: "Le Robert", prix_m2: 2500, lien_annonce: "https://example.com/18", date_publication: "2025-12-07", actif: true, longitude: -60.9370, latitude: 14.6780 },
  { titre: "Maison F4 Grande Anse", prix: 380000, type_bien: "maison", surface: 120, nb_pieces: 4, commune: "Les Anses-d'Arlet", prix_m2: 3167, lien_annonce: "https://example.com/19", date_publication: "2025-11-22", actif: true, longitude: -61.0850, latitude: 14.4990 },
  { titre: "Local commercial Marina", prix: 250000, type_bien: "local_commercial", surface: 120, nb_pieces: null, commune: "Le Marin", prix_m2: 2083, lien_annonce: "https://example.com/20", date_publication: "2025-12-11", actif: true, longitude: -60.8720, latitude: 14.4700 },
];

// ════════════════════════════════════════════════════════════════
// 5. LOGEMENTS VACANTS (LOVAC)
// ════════════════════════════════════════════════════════════════

const lovac = [
  { commune: "Fort-de-France", code_commune: "97209", nb_logements_vacants: 4850, taux_vacance: 14.2, duree_vacance_moyenne: 3.8, annee: 2024 },
  { commune: "Le Lamentin", code_commune: "97213", nb_logements_vacants: 1820, taux_vacance: 9.5, duree_vacance_moyenne: 2.9, annee: 2024 },
  { commune: "Schœlcher", code_commune: "97229", nb_logements_vacants: 980, taux_vacance: 8.7, duree_vacance_moyenne: 2.5, annee: 2024 },
  { commune: "Les Trois-Îlets", code_commune: "97231", nb_logements_vacants: 520, taux_vacance: 11.3, duree_vacance_moyenne: 3.2, annee: 2024 },
  { commune: "Sainte-Anne", code_commune: "97226", nb_logements_vacants: 680, taux_vacance: 12.8, duree_vacance_moyenne: 3.5, annee: 2024 },
  { commune: "Le Robert", code_commune: "97222", nb_logements_vacants: 1150, taux_vacance: 10.1, duree_vacance_moyenne: 3.0, annee: 2024 },
  { commune: "Ducos", code_commune: "97207", nb_logements_vacants: 620, taux_vacance: 7.8, duree_vacance_moyenne: 2.3, annee: 2024 },
  { commune: "Le Marin", code_commune: "97217", nb_logements_vacants: 450, taux_vacance: 10.5, duree_vacance_moyenne: 3.1, annee: 2024 },
  { commune: "Saint-Pierre", code_commune: "97225", nb_logements_vacants: 890, taux_vacance: 18.5, duree_vacance_moyenne: 5.2, annee: 2024 },
  { commune: "Sainte-Luce", code_commune: "97227", nb_logements_vacants: 380, taux_vacance: 9.2, duree_vacance_moyenne: 2.7, annee: 2024 },
  { commune: "Le Diamant", code_commune: "97206", nb_logements_vacants: 410, taux_vacance: 11.8, duree_vacance_moyenne: 3.4, annee: 2024 },
  { commune: "Le François", code_commune: "97210", nb_logements_vacants: 920, taux_vacance: 8.9, duree_vacance_moyenne: 2.6, annee: 2024 },
  { commune: "Rivière-Salée", code_commune: "97221", nb_logements_vacants: 480, taux_vacance: 7.5, duree_vacance_moyenne: 2.2, annee: 2024 },
  { commune: "Gros-Morne", code_commune: "97212", nb_logements_vacants: 520, taux_vacance: 11.5, duree_vacance_moyenne: 3.8, annee: 2024 },
  { commune: "Saint-Joseph", code_commune: "97224", nb_logements_vacants: 650, taux_vacance: 9.8, duree_vacance_moyenne: 3.0, annee: 2024 },
  { commune: "La Trinité", code_commune: "97230", nb_logements_vacants: 780, taux_vacance: 10.8, duree_vacance_moyenne: 3.2, annee: 2024 },
  { commune: "Rivière-Pilote", code_commune: "97220", nb_logements_vacants: 560, taux_vacance: 10.2, duree_vacance_moyenne: 3.3, annee: 2024 },
  { commune: "Le Vauclin", code_commune: "97232", nb_logements_vacants: 490, taux_vacance: 11.0, duree_vacance_moyenne: 3.5, annee: 2024 },
  { commune: "Saint-Esprit", code_commune: "97223", nb_logements_vacants: 350, taux_vacance: 8.3, duree_vacance_moyenne: 2.5, annee: 2024 },
  { commune: "Les Anses-d'Arlet", code_commune: "97202", nb_logements_vacants: 280, taux_vacance: 13.5, duree_vacance_moyenne: 4.0, annee: 2024 },
  { commune: "Case-Pilote", code_commune: "97205", nb_logements_vacants: 190, taux_vacance: 7.2, duree_vacance_moyenne: 2.1, annee: 2024 },
  { commune: "Le Carbet", code_commune: "97204", nb_logements_vacants: 220, taux_vacance: 9.0, duree_vacance_moyenne: 2.8, annee: 2024 },
  { commune: "Bellefontaine", code_commune: "97234", nb_logements_vacants: 95, taux_vacance: 8.5, duree_vacance_moyenne: 2.6, annee: 2024 },
  { commune: "Le Morne-Rouge", code_commune: "97218", nb_logements_vacants: 240, taux_vacance: 12.0, duree_vacance_moyenne: 3.9, annee: 2024 },
  { commune: "Le Lorrain", code_commune: "97214", nb_logements_vacants: 380, taux_vacance: 13.2, duree_vacance_moyenne: 4.1, annee: 2024 },
  { commune: "Le Marigot", code_commune: "97216", nb_logements_vacants: 180, taux_vacance: 11.5, duree_vacance_moyenne: 3.7, annee: 2024 },
  { commune: "Sainte-Marie", code_commune: "97228", nb_logements_vacants: 850, taux_vacance: 10.5, duree_vacance_moyenne: 3.2, annee: 2024 },
  { commune: "Le Prêcheur", code_commune: "97219", nb_logements_vacants: 140, taux_vacance: 15.8, duree_vacance_moyenne: 4.8, annee: 2024 },
  { commune: "Grand-Rivière", code_commune: "97211", nb_logements_vacants: 120, taux_vacance: 17.2, duree_vacance_moyenne: 5.5, annee: 2024 },
  { commune: "Basse-Pointe", code_commune: "97203", nb_logements_vacants: 180, taux_vacance: 14.8, duree_vacance_moyenne: 4.5, annee: 2024 },
];

// ════════════════════════════════════════════════════════════════
// 6. PARC SOCIAL (RPLS)
// ════════════════════════════════════════════════════════════════

const social = [
  { commune: "Fort-de-France", code_commune: "97209", bailleur: "SIMAR", nb_logements: 4200 },
  { commune: "Fort-de-France", code_commune: "97209", bailleur: "OZANAM", nb_logements: 2800 },
  { commune: "Fort-de-France", code_commune: "97209", bailleur: "SMHLM", nb_logements: 1500 },
  { commune: "Le Lamentin", code_commune: "97213", bailleur: "SIMAR", nb_logements: 2100 },
  { commune: "Le Lamentin", code_commune: "97213", bailleur: "OZANAM", nb_logements: 1400 },
  { commune: "Le Lamentin", code_commune: "97213", bailleur: "SMHLM", nb_logements: 800 },
  { commune: "Schœlcher", code_commune: "97229", bailleur: "SIMAR", nb_logements: 950 },
  { commune: "Schœlcher", code_commune: "97229", bailleur: "OZANAM", nb_logements: 620 },
  { commune: "Les Trois-Îlets", code_commune: "97231", bailleur: "SIMAR", nb_logements: 280 },
  { commune: "Les Trois-Îlets", code_commune: "97231", bailleur: "OZANAM", nb_logements: 150 },
  { commune: "Sainte-Anne", code_commune: "97226", bailleur: "SIMAR", nb_logements: 420 },
  { commune: "Sainte-Anne", code_commune: "97226", bailleur: "OZANAM", nb_logements: 310 },
  { commune: "Le Robert", code_commune: "97222", bailleur: "SIMAR", nb_logements: 850 },
  { commune: "Le Robert", code_commune: "97222", bailleur: "OZANAM", nb_logements: 480 },
  { commune: "Ducos", code_commune: "97207", bailleur: "SIMAR", nb_logements: 520 },
  { commune: "Ducos", code_commune: "97207", bailleur: "OZANAM", nb_logements: 340 },
  { commune: "Le Marin", code_commune: "97217", bailleur: "SIMAR", nb_logements: 380 },
  { commune: "Saint-Pierre", code_commune: "97225", bailleur: "SIMAR", nb_logements: 290 },
  { commune: "Saint-Pierre", code_commune: "97225", bailleur: "OZANAM", nb_logements: 180 },
  { commune: "Sainte-Luce", code_commune: "97227", bailleur: "SIMAR", nb_logements: 310 },
  { commune: "Le Diamant", code_commune: "97206", bailleur: "SIMAR", nb_logements: 250 },
  { commune: "Le François", code_commune: "97210", bailleur: "SIMAR", nb_logements: 680 },
  { commune: "Le François", code_commune: "97210", bailleur: "OZANAM", nb_logements: 420 },
  { commune: "Rivière-Salée", code_commune: "97221", bailleur: "SIMAR", nb_logements: 450 },
  { commune: "Rivière-Salée", code_commune: "97221", bailleur: "OZANAM", nb_logements: 280 },
  { commune: "Gros-Morne", code_commune: "97212", bailleur: "SIMAR", nb_logements: 320 },
  { commune: "Saint-Joseph", code_commune: "97224", bailleur: "SIMAR", nb_logements: 480 },
  { commune: "Saint-Joseph", code_commune: "97224", bailleur: "OZANAM", nb_logements: 250 },
  { commune: "La Trinité", code_commune: "97230", bailleur: "SIMAR", nb_logements: 620 },
  { commune: "La Trinité", code_commune: "97230", bailleur: "OZANAM", nb_logements: 380 },
  { commune: "Rivière-Pilote", code_commune: "97220", bailleur: "SIMAR", nb_logements: 350 },
  { commune: "Le Vauclin", code_commune: "97232", bailleur: "SIMAR", nb_logements: 290 },
  { commune: "Saint-Esprit", code_commune: "97223", bailleur: "SIMAR", nb_logements: 310 },
  { commune: "Sainte-Marie", code_commune: "97228", bailleur: "SIMAR", nb_logements: 580 },
  { commune: "Sainte-Marie", code_commune: "97228", bailleur: "OZANAM", nb_logements: 350 },
];

// ════════════════════════════════════════════════════════════════
// 7. DONNÉES INSEE
// ════════════════════════════════════════════════════════════════

const insee = [
  { commune: "Fort-de-France", code_commune: "97209", population: 78000, menages: 34500, revenu_median: 18200, taux_chomage: 22.5, taux_pauvrete: 28.3, part_proprietaires: 38.2, part_locataires: 55.8, age_moyen: 42.5 },
  { commune: "Le Lamentin", code_commune: "97213", population: 40500, menages: 16800, revenu_median: 20100, taux_chomage: 18.2, taux_pauvrete: 22.1, part_proprietaires: 52.5, part_locataires: 42.3, age_moyen: 39.8 },
  { commune: "Schœlcher", code_commune: "97229", population: 20800, menages: 8900, revenu_median: 22500, taux_chomage: 15.8, taux_pauvrete: 18.5, part_proprietaires: 48.9, part_locataires: 45.2, age_moyen: 41.2 },
  { commune: "Les Trois-Îlets", code_commune: "97231", population: 8200, menages: 3600, revenu_median: 24800, taux_chomage: 14.2, taux_pauvrete: 15.8, part_proprietaires: 55.3, part_locataires: 38.5, age_moyen: 44.5 },
  { commune: "Sainte-Anne", code_commune: "97226", population: 5200, menages: 2300, revenu_median: 19500, taux_chomage: 20.1, taux_pauvrete: 24.5, part_proprietaires: 58.2, part_locataires: 35.8, age_moyen: 43.8 },
  { commune: "Le Robert", code_commune: "97222", population: 23200, menages: 9500, revenu_median: 18800, taux_chomage: 21.0, taux_pauvrete: 25.2, part_proprietaires: 50.5, part_locataires: 43.2, age_moyen: 40.5 },
  { commune: "Ducos", code_commune: "97207", population: 18500, menages: 7200, revenu_median: 19200, taux_chomage: 19.5, taux_pauvrete: 23.8, part_proprietaires: 54.8, part_locataires: 39.5, age_moyen: 38.2 },
  { commune: "Le Marin", code_commune: "97217", population: 9200, menages: 4100, revenu_median: 19800, taux_chomage: 19.8, taux_pauvrete: 23.2, part_proprietaires: 52.1, part_locataires: 41.5, age_moyen: 42.8 },
  { commune: "Saint-Pierre", code_commune: "97225", population: 4100, menages: 1900, revenu_median: 16500, taux_chomage: 28.5, taux_pauvrete: 35.2, part_proprietaires: 45.8, part_locataires: 48.2, age_moyen: 45.2 },
  { commune: "Sainte-Luce", code_commune: "97227", population: 10200, menages: 4500, revenu_median: 20800, taux_chomage: 17.5, taux_pauvrete: 20.5, part_proprietaires: 55.2, part_locataires: 38.8, age_moyen: 41.5 },
  { commune: "Le Diamant", code_commune: "97206", population: 6200, menages: 2800, revenu_median: 20200, taux_chomage: 18.8, taux_pauvrete: 21.8, part_proprietaires: 56.5, part_locataires: 37.2, age_moyen: 43.2 },
  { commune: "Le François", code_commune: "97210", population: 19500, menages: 8200, revenu_median: 18500, taux_chomage: 21.5, taux_pauvrete: 26.0, part_proprietaires: 51.8, part_locataires: 42.5, age_moyen: 40.8 },
  { commune: "Rivière-Salée", code_commune: "97221", population: 13800, menages: 5500, revenu_median: 19000, taux_chomage: 20.2, taux_pauvrete: 24.5, part_proprietaires: 53.5, part_locataires: 40.8, age_moyen: 39.5 },
  { commune: "Gros-Morne", code_commune: "97212", population: 10200, menages: 4200, revenu_median: 17200, taux_chomage: 24.5, taux_pauvrete: 30.2, part_proprietaires: 58.5, part_locataires: 35.2, age_moyen: 42.8 },
  { commune: "Saint-Joseph", code_commune: "97224", population: 17500, menages: 7000, revenu_median: 17800, taux_chomage: 22.8, taux_pauvrete: 27.5, part_proprietaires: 55.8, part_locataires: 38.5, age_moyen: 41.5 },
  { commune: "La Trinité", code_commune: "97230", population: 13500, menages: 5800, revenu_median: 17500, taux_chomage: 23.2, taux_pauvrete: 28.8, part_proprietaires: 49.5, part_locataires: 44.2, age_moyen: 41.8 },
  { commune: "Rivière-Pilote", code_commune: "97220", population: 12800, menages: 5200, revenu_median: 17000, taux_chomage: 24.0, taux_pauvrete: 29.5, part_proprietaires: 57.2, part_locataires: 36.5, age_moyen: 43.5 },
  { commune: "Le Vauclin", code_commune: "97232", population: 8900, menages: 3800, revenu_median: 17200, taux_chomage: 23.5, taux_pauvrete: 28.0, part_proprietaires: 56.8, part_locataires: 37.2, age_moyen: 43.0 },
  { commune: "Saint-Esprit", code_commune: "97223", population: 9500, menages: 3900, revenu_median: 18200, taux_chomage: 21.8, taux_pauvrete: 25.5, part_proprietaires: 55.5, part_locataires: 38.8, age_moyen: 40.2 },
  { commune: "Les Anses-d'Arlet", code_commune: "97202", population: 3800, menages: 1700, revenu_median: 19500, taux_chomage: 19.5, taux_pauvrete: 22.8, part_proprietaires: 60.2, part_locataires: 33.5, age_moyen: 45.8 },
  { commune: "Case-Pilote", code_commune: "97205", population: 4800, menages: 2100, revenu_median: 20500, taux_chomage: 17.8, taux_pauvrete: 20.2, part_proprietaires: 58.5, part_locataires: 35.2, age_moyen: 42.2 },
  { commune: "Le Carbet", code_commune: "97204", population: 3800, menages: 1700, revenu_median: 18800, taux_chomage: 20.5, taux_pauvrete: 24.0, part_proprietaires: 55.0, part_locataires: 38.5, age_moyen: 43.5 },
  { commune: "Sainte-Marie", code_commune: "97228", population: 16500, menages: 6800, revenu_median: 17500, taux_chomage: 23.8, taux_pauvrete: 29.0, part_proprietaires: 52.5, part_locataires: 41.2, age_moyen: 41.0 },
  { commune: "Le Lorrain", code_commune: "97214", population: 7200, menages: 3100, revenu_median: 16800, taux_chomage: 25.5, taux_pauvrete: 31.5, part_proprietaires: 56.0, part_locataires: 37.5, age_moyen: 43.8 },
  { commune: "Le Marigot", code_commune: "97216", population: 3600, menages: 1500, revenu_median: 16200, taux_chomage: 26.0, taux_pauvrete: 32.5, part_proprietaires: 58.5, part_locataires: 35.0, age_moyen: 44.5 },
  { commune: "Le Prêcheur", code_commune: "97219", population: 1500, menages: 680, revenu_median: 15800, taux_chomage: 28.0, taux_pauvrete: 34.0, part_proprietaires: 62.0, part_locataires: 32.0, age_moyen: 46.5 },
  { commune: "Grand-Rivière", code_commune: "97211", population: 800, menages: 350, revenu_median: 15200, taux_chomage: 30.0, taux_pauvrete: 36.5, part_proprietaires: 64.0, part_locataires: 30.0, age_moyen: 48.0 },
  { commune: "Basse-Pointe", code_commune: "97203", population: 3500, menages: 1500, revenu_median: 16000, taux_chomage: 27.0, taux_pauvrete: 33.0, part_proprietaires: 60.0, part_locataires: 34.0, age_moyen: 45.0 },
  { commune: "Bellefontaine", code_commune: "97234", population: 1800, menages: 780, revenu_median: 17500, taux_chomage: 22.0, taux_pauvrete: 26.5, part_proprietaires: 57.5, part_locataires: 36.0, age_moyen: 42.0 },
  { commune: "Le Morne-Rouge", code_commune: "97218", population: 5200, menages: 2200, revenu_median: 16500, taux_chomage: 25.0, taux_pauvrete: 31.0, part_proprietaires: 56.5, part_locataires: 37.0, age_moyen: 43.0 },
];

// ════════════════════════════════════════════════════════════════
// EXÉCUTION
// ════════════════════════════════════════════════════════════════

console.log("🚀 Début du seed CarteImmoMartinique...\n");

await insert("transactions_dvf", dvf);
await insert("risques_naturels", risques);
await insert("permis_construire", permis);
await insert("annonces_achatimmo", annonces);
await insert("logements_vacants", lovac);
await insert("parc_social", social);
await insert("donnees_insee", insee);

console.log("\n✅ Seed terminé !");
