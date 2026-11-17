import { createBrowserClient } from "@supabase/ssr";
import { sanitizeSupabaseUrl } from "./helpers";

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key").trim();

  return createBrowserClient(supabaseUrl, supabaseKey);
}
