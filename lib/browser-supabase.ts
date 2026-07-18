"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/** Returns null for the personal-pilot build. All callers must treat null as
 * a local-only state rather than silently implying hosted persistence. */
export function browserSupabase() {
  if (typeof window === "undefined") return null;
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && anonKey ? createClient(url, anonKey) : null;
  return client;
}
