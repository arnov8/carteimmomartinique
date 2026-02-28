-- ============================================================
-- Fonctions RPC pour CarteImmoMartinique
-- ============================================================

-- Rafraîchir les vues matérialisées DVF
CREATE OR REPLACE FUNCTION refresh_dvf_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dvf_stats_commune;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recherche de transactions DVF dans un bounding box
CREATE OR REPLACE FUNCTION get_dvf_in_bbox(
  min_lng DOUBLE PRECISION,
  min_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  type_filter TEXT DEFAULT NULL,
  date_from DATE DEFAULT NULL,
  date_to DATE DEFAULT NULL,
  prix_min NUMERIC DEFAULT NULL,
  prix_max NUMERIC DEFAULT NULL,
  max_results INTEGER DEFAULT 1000
)
RETURNS SETOF transactions_dvf AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM transactions_dvf
  WHERE
    geom IS NOT NULL
    AND ST_Intersects(
      geom,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    )
    AND (type_filter IS NULL OR type_local = type_filter)
    AND (date_from IS NULL OR date_mutation >= date_from)
    AND (date_to IS NULL OR date_mutation <= date_to)
    AND (prix_min IS NULL OR valeur_fonciere >= prix_min)
    AND (prix_max IS NULL OR valeur_fonciere <= prix_max)
  ORDER BY date_mutation DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- Statistiques DVF par commune
CREATE OR REPLACE FUNCTION get_dvf_stats_commune(
  p_code_commune TEXT DEFAULT NULL
)
RETURNS TABLE (
  code_commune VARCHAR(5),
  commune TEXT,
  type_local TEXT,
  annee DOUBLE PRECISION,
  nb_transactions BIGINT,
  prix_median_m2 DOUBLE PRECISION,
  prix_moyen_m2 DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.code_commune,
    s.commune,
    s.type_local,
    s.annee,
    s.nb_transactions,
    s.prix_median_m2,
    s.prix_moyen_m2
  FROM dvf_stats_commune s
  WHERE (p_code_commune IS NULL OR s.code_commune = p_code_commune)
  ORDER BY s.annee DESC, s.commune;
END;
$$ LANGUAGE plpgsql STABLE;

-- Recherche de parcelles dans un bounding box
CREATE OR REPLACE FUNCTION get_parcelles_in_bbox(
  min_lng DOUBLE PRECISION,
  min_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  max_results INTEGER DEFAULT 500
)
RETURNS SETOF parcelles_cadastrales AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM parcelles_cadastrales
  WHERE
    geom IS NOT NULL
    AND ST_Intersects(
      geom,
      ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    )
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- Analyse de secteur autour d'un point (pour la contextualisation des annonces)
CREATE OR REPLACE FUNCTION analyse_secteur(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION,
  p_rayon_m INTEGER DEFAULT 500
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  point GEOMETRY;
  buffer GEOMETRY;
BEGIN
  point := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326);
  -- Buffer en mètres (conversion approximative)
  buffer := ST_Buffer(point::geography, p_rayon_m)::geometry;

  SELECT json_build_object(
    -- Stats DVF dans le rayon
    'dvf', (
      SELECT json_build_object(
        'nb_transactions', COUNT(*),
        'prix_median_m2', PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY prix_m2),
        'prix_moyen_m2', AVG(prix_m2),
        'prix_min_m2', MIN(prix_m2),
        'prix_max_m2', MAX(prix_m2)
      )
      FROM transactions_dvf
      WHERE geom IS NOT NULL
        AND ST_Intersects(geom, buffer)
        AND prix_m2 IS NOT NULL AND prix_m2 > 0
        AND date_mutation >= CURRENT_DATE - INTERVAL '2 years'
    ),
    -- Risques naturels
    'risques', (
      SELECT COALESCE(json_agg(json_build_object(
        'type_risque', type_risque,
        'niveau', niveau,
        'description', description
      )), '[]'::json)
      FROM risques_naturels
      WHERE geom IS NOT NULL AND ST_Intersects(geom, point)
    ),
    -- Zone PLU
    'plu', (
      SELECT json_build_object(
        'zone_type', zone_type,
        'zone_code', zone_code,
        'libelle', libelle
      )
      FROM zones_plu
      WHERE geom IS NOT NULL AND ST_Intersects(geom, point)
      LIMIT 1
    ),
    -- Permis de construire à proximité
    'permis', (
      SELECT json_build_object(
        'nb_permis', COUNT(*),
        'nb_logements_total', COALESCE(SUM(nombre_logements), 0)
      )
      FROM permis_construire
      WHERE geom IS NOT NULL
        AND ST_Intersects(geom, buffer)
        AND decision = 'accorde'
        AND date_decision >= CURRENT_DATE - INTERVAL '2 years'
    ),
    -- INSEE
    'insee', (
      SELECT json_build_object(
        'population', population,
        'revenu_median', revenu_median,
        'evolution_population_5ans', evolution_population_5ans
      )
      FROM donnees_insee
      WHERE geom IS NOT NULL AND ST_Intersects(geom, point)
      LIMIT 1
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;
