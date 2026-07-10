import { AlertTriangle } from "lucide-react";

import { getMissingSupabasePublicEnvKeys } from "@/lib/config/supabase-env";

export function ConfigWarningBanner() {
  const missingKeys = getMissingSupabasePublicEnvKeys();

  if (missingKeys.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      className="border-b border-amber-300 bg-amber-100 px-4 py-3 text-amber-950"
    >
      <div className="mx-auto flex max-w-4xl items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0"
          aria-hidden
        />
        <div className="space-y-1 text-sm">
          <p className="font-semibold">Configuratiefout: Supabase niet ingesteld</p>
          <p>
            Authenticatie is niet beschikbaar. Controleer de omgevingsvariabelen
            voor deployment (zie{" "}
            <code className="rounded bg-amber-200/80 px-1 py-0.5 text-xs">
              .env.example
            </code>
            ).
          </p>
          <p className="text-xs text-amber-900">
            Ontbrekend: {missingKeys.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
