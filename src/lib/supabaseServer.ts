import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

export function createSupabaseServerClient() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const supabaseKey = serviceRoleKey || anonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase env vars. Required: PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
