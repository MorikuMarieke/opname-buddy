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

export function getSupabasePublicEnv(): {
  url: string;
  anonKey: string;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new SupabaseConfigError();
  }

  return { url, anonKey };
}

export class SupabaseConfigError extends Error {
  constructor(message = "Supabase public environment is not configured.") {
    super(message);
    this.name = "SupabaseConfigError";
  }
}
