import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-carbon-black-900">Inloggen</h1>
        <p className="text-sm text-carbon-black-600">
          Log in om verder te gaan met OpnameBuddy.
        </p>
      </div>

      {error === "roles" ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Kon je rollen niet ophalen na het inloggen.
          {message ? ` (${message})` : " Controleer je Supabase API-sleutels in .env.local."}
        </p>
      ) : null}

      <LoginForm />

      <p className="text-center text-sm text-carbon-black-600">
        Nog geen account?{" "}
        <Link href="/register" className="font-medium text-copper-600 hover:underline">
          Registreren
        </Link>
      </p>
    </div>
  );
}
