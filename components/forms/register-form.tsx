"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PrimaryButton } from "@/components/ui/primary-button";
import { createClient } from "@/lib/supabase/client";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 placeholder:text-carbon-black-400 disabled:opacity-50";

function getErrorMessage(message: string): string {
  if (message.includes("User already registered")) {
    return "Dit e-mailadres is al geregistreerd.";
  }
  if (message.includes("Password")) {
    return "Het wachtwoord voldoet niet aan de vereisten (minimaal 6 tekens).";
  }
  return "Registreren is mislukt. Probeer het opnieuw.";
}

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(getErrorMessage(signUpError.message));
      setIsLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setConfirmationSent(true);
    setIsLoading(false);
  }

  if (confirmationSent) {
    return (
      <div className="space-y-3 text-center" role="status">
        <p className="text-sm font-medium text-carbon-black-900">
          Account aangemaakt
        </p>
        <p className="text-sm text-carbon-black-600">
          Controleer je e-mail om je account te bevestigen. Daarna kun je
          inloggen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-carbon-black-900"
        >
          Naam
        </label>
        <input
          id="name"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          disabled={isLoading}
          placeholder="Jouw naam"
          className={inputClasses}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-carbon-black-900"
        >
          E-mailadres
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          placeholder="naam@voorbeeld.nl"
          className={inputClasses}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-carbon-black-900"
        >
          Wachtwoord
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          placeholder="••••••••"
          className={inputClasses}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <PrimaryButton type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Account aanmaken..." : "Account aanmaken"}
      </PrimaryButton>
    </form>
  );
}
