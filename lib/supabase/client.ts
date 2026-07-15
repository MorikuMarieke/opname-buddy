import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/config/supabase-env";
import type { Database } from "@/types/database";

export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv();

  return createBrowserClient<Database>(url, anonKey);
}
