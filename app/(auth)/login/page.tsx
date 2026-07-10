import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";
import { getLoginPageErrorMessage } from "@/lib/auth/login-errors";
import { isSupabasePublicEnvConfigured } from "@/lib/config/supabase-env";
import { isCurrentAccountActive, signOutCurrentUser } from "@/lib/auth/account-active";
import { getCurrentUser } from "@/lib/auth/get-current-user";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;
  const pageError = getLoginPageErrorMessage(error, message);
  const configConfigured = isSupabasePublicEnvConfigured();
  const user = await getCurrentUser();
  const userActive = user ? await isCurrentAccountActive(user) : null;

  if (user && userActive === false) {
    await signOutCurrentUser();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-carbon-black-900">Inloggen</h1>
        <p className="text-sm text-carbon-black-600">
          Log in om verder te gaan met OpnameBuddy.
        </p>
      </div>

      {pageError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {pageError}
        </p>
      ) : null}

      <LoginForm
        configMissing={!configConfigured}
        pageErrorCode={error ?? null}
      />

      <p className="text-center text-sm text-carbon-black-600">
        Nog geen account?{" "}
        <Link href="/register" className="font-medium text-copper-600 hover:underline">
          Registreren
        </Link>
      </p>
    </div>
  );
}
