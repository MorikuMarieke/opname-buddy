import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { AuthLayout } from "@/components/layout/auth-layout";
import { PrimaryButton } from "@/components/ui/primary-button";

export default function UnauthorizedPage() {
  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-carbon-black-900">
            Geen toegang
          </h1>
          <p className="text-sm text-carbon-black-600">
            Je account heeft geen rol of geen toegang tot deze module. Nieuwe
            accounts hebben een rol nodig in Supabase (bijvoorbeeld patient via
            user_roles). Neem contact op met een beheerder als je denkt dat dit
            niet klopt.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryButton href="/login" className="w-full">
            Terug naar inloggen
          </PrimaryButton>
          <LogoutButton />
        </div>

        <p className="text-sm text-carbon-black-600">
          Of ga terug naar de{" "}
          <Link href="/" className="font-medium text-copper-600 hover:underline">
            startpagina
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
}
