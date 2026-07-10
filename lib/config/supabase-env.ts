const SUPABASE_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export type SupabasePublicEnvKey = (typeof SUPABASE_PUBLIC_ENV_KEYS)[number];

export function getMissingSupabasePublicEnvKeys(): SupabasePublicEnvKey[] {
  return SUPABASE_PUBLIC_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

export function isSupabasePublicEnvConfigured(): boolean {
  return getMissingSupabasePublicEnvKeys().length === 0;
}
