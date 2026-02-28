-- ============================================================
-- CarteImmoMartinique - Schéma de base de données
-- PostgreSQL + PostGIS
-- ============================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Pour la recherche full-text

-- ============================================================
-- 1. Transactions DVF (Demandes de Valeurs Foncières)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions_dvf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_mutation DATE NOT NULL,
  nature_mutation TEXT NOT NULL,
  valeur_fonciere NUMERIC(12, 2) NOT NULL,
  adresse TEXT,
  code_postal VARCHAR(5),
  commune TEXT NOT NULL,
  code_commune VARCHAR(5) NOT NULL,
  type_local TEXT,
  surface_reelle_bati NUMERIC(10, 2),
  nombre_pieces INTEGER,
  surface_terrain NUMERIC(10, 2),
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  prix_m2 NUMERIC(10, 2),
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dvf_geom ON transactions_dvf USING GIST (geom);
CREATE INDEX idx_dvf_commune ON transactions_dvf (code_commune);
CREATE INDEX idx_dvf_date ON transactions_dvf (date_mutation);
CREATE INDEX idx_dvf_type ON transactions_dvf (type_local);
CREATE INDEX idx_dvf_coords ON transactions_dvf (longitude, latitude);

-- Trigger pour calculer la géométrie à partir de lon/lat
CREATE OR REPLACE FUNCTION dvf_set_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  -- Calcul du prix au m²
  IF NEW.surface_reelle_bati IS NOT NULL AND NEW.surface_reelle_bati > 0 THEN
    NEW.prix_m2 = NEW.valeur_fonciere / NEW.surface_reelle_bati;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dvf_set_geom
  BEFORE INSERT OR UPDATE ON transactions_dvf
  FOR EACH ROW EXECUTE FUNCTION dvf_set_geom();

-- ============================================================
-- 2. Parcelles Cadastrales
-- ============================================================
CREATE TABLE IF NOT EXISTS parcelles_cadastrales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune TEXT NOT NULL,
  prefixe VARCHAR(3),
  section VARCHAR(2) NOT NULL,
  numero VARCHAR(4) NOT NULL,
  contenance NUMERIC(12, 2),
  code_commune VARCHAR(5) NOT NULL,
  geom GEOMETRY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_parcelles_geom ON parcelles_cadastrales USING GIST (geom);
CREATE INDEX idx_parcelles_ref ON parcelles_cadastrales (code_commune, section, numero);

-- ============================================================
-- 3. Zones PLU (Plan Local d'Urbanisme)
-- ============================================================
CREATE TABLE IF NOT EXISTS zones_plu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune TEXT NOT NULL,
  zone_type VARCHAR(2) NOT NULL CHECK (zone_type IN ('U', 'AU', 'A', 'N')),
  zone_code VARCHAR(20),
  libelle TEXT,
  geom GEOMETRY(Polygon, 4326),
  reglements_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plu_geom ON zones_plu USING GIST (geom);
CREATE INDEX idx_plu_type ON zones_plu (zone_type);

-- ============================================================
-- 4. Risques Naturels
-- ============================================================
CREATE TABLE IF NOT EXISTS risques_naturels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commune TEXT NOT NULL,
  type_risque VARCHAR(30) NOT NULL CHECK (type_risque IN (
    'sismique', 'inondation', 'mouvement_terrain', 'submersion_marine', 'volcanique'
  )),
  niveau VARCHAR(10) NOT NULL CHECK (niveau IN ('faible', 'moyen', 'fort', 'tres_fort')),
  geom GEOMETRY(Polygon, 4326),
  description TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_risques_geom ON risques_naturels USING GIST (geom);
CREATE INDEX idx_risques_type ON risques_naturels (type_risque);
CREATE INDEX idx_risques_niveau ON risques_naturels (niveau);

-- ============================================================
-- 5. Données INSEE
-- ============================================================
CREATE TABLE IF NOT EXISTS donnees_insee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_iris VARCHAR(9),
  code_commune VARCHAR(5) NOT NULL,
  commune TEXT NOT NULL,
  population INTEGER,
  menages INTEGER,
  revenu_median NUMERIC(10, 2),
  taux_chomage NUMERIC(5, 2),
  evolution_population_5ans NUMERIC(5, 2),
  geom GEOMETRY(MultiPolygon, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_insee_geom ON donnees_insee USING GIST (geom);
CREATE INDEX idx_insee_commune ON donnees_insee (code_commune);
CREATE INDEX idx_insee_iris ON donnees_insee (code_iris);

-- ============================================================
-- 6. Permis de Construire (Sitadel)
-- ============================================================
CREATE TABLE IF NOT EXISTS permis_construire (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_permis VARCHAR(30),
  date_depot DATE,
  date_decision DATE,
  decision VARCHAR(10) CHECK (decision IN ('accorde', 'refuse', 'en_cours')),
  type_construction VARCHAR(15) CHECK (type_construction IN (
    'individuel', 'collectif', 'tertiaire', 'industriel'
  )),
  nombre_logements INTEGER DEFAULT 0,
  surface_plancher NUMERIC(10, 2),
  adresse TEXT,
  commune TEXT NOT NULL,
  code_commune VARCHAR(5) NOT NULL,
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  maitre_ouvrage TEXT,
  nature_travaux VARCHAR(20) CHECK (nature_travaux IN (
    'construction_neuve', 'extension', 'renovation', 'demolition'
  )),
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_permis_geom ON permis_construire USING GIST (geom);
CREATE INDEX idx_permis_commune ON permis_construire (code_commune);
CREATE INDEX idx_permis_decision ON permis_construire (decision);
CREATE INDEX idx_permis_date ON permis_construire (date_depot);

CREATE OR REPLACE FUNCTION permis_set_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_permis_set_geom
  BEFORE INSERT OR UPDATE ON permis_construire
  FOR EACH ROW EXECUTE FUNCTION permis_set_geom();

-- ============================================================
-- 7. Logements Vacants (LOVAC)
-- ============================================================
CREATE TABLE IF NOT EXISTS logements_vacants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_commune VARCHAR(5) NOT NULL,
  commune TEXT NOT NULL,
  nb_logements_vacants INTEGER,
  taux_vacance NUMERIC(5, 2),
  duree_vacance_moyenne NUMERIC(5, 2),
  annee INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vacants_commune ON logements_vacants (code_commune);
CREATE INDEX idx_vacants_annee ON logements_vacants (annee);

-- ============================================================
-- 8. Parc Social (RPLS)
-- ============================================================
CREATE TABLE IF NOT EXISTS parc_social (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_commune VARCHAR(5) NOT NULL,
  commune TEXT NOT NULL,
  bailleur TEXT,
  nb_logements INTEGER,
  type_financement TEXT,
  annee_construction INTEGER,
  nb_pieces INTEGER,
  adresse TEXT,
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  loyer_moyen NUMERIC(8, 2),
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_social_geom ON parc_social USING GIST (geom);
CREATE INDEX idx_social_commune ON parc_social (code_commune);

-- ============================================================
-- 9. Annonces (achatimmomartinique.com)
-- ============================================================
CREATE TABLE IF NOT EXISTS annonces_achatimmo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  prix NUMERIC(12, 2) NOT NULL,
  type_bien VARCHAR(20) CHECK (type_bien IN (
    'maison', 'appartement', 'terrain', 'local_commercial'
  )),
  surface NUMERIC(10, 2),
  nb_pieces INTEGER,
  adresse TEXT,
  commune TEXT NOT NULL,
  code_commune VARCHAR(5) NOT NULL,
  longitude DOUBLE PRECISION,
  latitude DOUBLE PRECISION,
  photo_url TEXT,
  lien_annonce TEXT NOT NULL,
  date_publication DATE,
  actif BOOLEAN DEFAULT true,
  prix_m2 NUMERIC(10, 2),
  geom GEOMETRY(Point, 4326),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_annonces_geom ON annonces_achatimmo USING GIST (geom);
CREATE INDEX idx_annonces_commune ON annonces_achatimmo (code_commune);
CREATE INDEX idx_annonces_actif ON annonces_achatimmo (actif);
CREATE INDEX idx_annonces_type ON annonces_achatimmo (type_bien);
CREATE INDEX idx_annonces_prix ON annonces_achatimmo (prix);

CREATE OR REPLACE FUNCTION annonces_set_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  -- Calcul du prix au m²
  IF NEW.surface IS NOT NULL AND NEW.surface > 0 THEN
    NEW.prix_m2 = NEW.prix / NEW.surface;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_annonces_set_geom
  BEFORE INSERT OR UPDATE ON annonces_achatimmo
  FOR EACH ROW EXECUTE FUNCTION annonces_set_geom();

-- ============================================================
-- 10. Logs de synchronisation
-- ============================================================
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(30) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status VARCHAR(10) CHECK (status IN ('running', 'success', 'error')),
  nb_added INTEGER DEFAULT 0,
  nb_updated INTEGER DEFAULT 0,
  nb_deleted INTEGER DEFAULT 0,
  nb_errors INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Vues matérialisées pour les agrégats DVF
-- ============================================================

-- Agrégats par commune
CREATE MATERIALIZED VIEW IF NOT EXISTS dvf_stats_commune AS
SELECT
  code_commune,
  commune,
  type_local,
  COUNT(*) AS nb_transactions,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY prix_m2) AS prix_median_m2,
  AVG(prix_m2) AS prix_moyen_m2,
  MIN(prix_m2) AS prix_min_m2,
  MAX(prix_m2) AS prix_max_m2,
  AVG(valeur_fonciere) AS prix_moyen,
  EXTRACT(YEAR FROM date_mutation) AS annee
FROM transactions_dvf
WHERE prix_m2 IS NOT NULL AND prix_m2 > 0
GROUP BY code_commune, commune, type_local, EXTRACT(YEAR FROM date_mutation);

CREATE UNIQUE INDEX idx_dvf_stats_commune
  ON dvf_stats_commune (code_commune, type_local, annee);

-- RLS (Row Level Security) - désactivé pour le moment, les données sont publiques
-- ALTER TABLE transactions_dvf ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read access" ON transactions_dvf FOR SELECT USING (true);
