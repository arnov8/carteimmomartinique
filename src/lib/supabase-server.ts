import { createClient } from "@supabase/supabase-js";

// Client Supabase côté serveur (API routes)
// Utilise la clé anon pour les requêtes publiques
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
