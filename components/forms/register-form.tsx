"use client";

import { useRef, useState } from "react";

import { PrimaryButton } from "@/components/ui/primary-button";
import { PasswordInput } from "@/components/ui/password-input";
import { registerPatientAccount } from "@/lib/auth/register-actions";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-sm text-carbon-black-900 placeholder:text-carbon-black-400 disabled:opacity-50";

function handleEnterToSubmit(
  event: React.KeyboardEvent<HTMLFormElement>,
  formRef: React.RefObject<HTMLFormElement | null>,
  isLoading: boolean,
  submitOnInputId: string,
) {
  if (event.key !== "Enter" || isLoading || event.nativeEvent.isComposing) {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.id !== submitOnInputId) {
    return;
  }

  event.preventDefault();
  formRef.current?.requestSubmit();
}

export function RegisterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    let isRedirecting = false;

    try {
      const result = await registerPatientAccount({
        fullName,
        email,
        password,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if (result.hasSession) {
        isRedirecting = true;
        window.location.assign("/auth/redirect");
        return;
      }

      setConfirmationSent(true);
    } catch {
      setError("Registreren is mislukt. Probeer het opnieuw.");
    } finally {
      if (!isRedirecting) {
        setIsLoading(false);
      }
    }
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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={(event) =>
        handleEnterToSubmit(event, formRef, isLoading, "password")
      }
      className="space-y-4"
    >
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
          enterKeyHint="next"
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
          enterKeyHint="next"
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
        <PasswordInput
          id="password"
          required
          minLength={6}
          autoComplete="new-password"
          enterKeyHint="go"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          placeholder="••••••••"
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
