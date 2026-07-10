"use client";

import { useRef, useState } from "react";

import { PrimaryButton } from "@/components/ui/primary-button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  LOGIN_ERROR_MESSAGES,
  mapLoginClientError,
  mapSupabaseSignInError,
  shouldSuppressDuplicateLoginError,
} from "@/lib/auth/login-errors";
import { createClient } from "@/lib/supabase/client";

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

export function LoginForm({
  configMissing,
  pageErrorCode = null,
}: {
  configMissing: boolean;
  pageErrorCode?: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isConfigMissing = configMissing;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    if (isConfigMissing) {
      setError(LOGIN_ERROR_MESSAGES.configMissing);
      setIsLoading(false);
      return;
    }

    let isRedirecting = false;

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (process.env.NODE_ENV === "development") {
          console.error("[login] signInWithPassword failed:", signInError.message);
        }

        const formError = mapSupabaseSignInError(signInError.message);

        if (!shouldSuppressDuplicateLoginError(formError, pageErrorCode ?? undefined)) {
          setError(formError);
        }

        return;
      }

      isRedirecting = true;
      window.location.assign("/auth/redirect");
    } catch (caughtError) {
      setError(mapLoginClientError(caughtError));
    } finally {
      if (!isRedirecting) {
        setIsLoading(false);
      }
    }
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
      {isConfigMissing ? (
        <p className="rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-950" role="alert">
          {LOGIN_ERROR_MESSAGES.configMissing}
        </p>
      ) : null}

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
          disabled={isLoading || isConfigMissing}
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
          autoComplete="current-password"
          enterKeyHint="go"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading || isConfigMissing}
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <PrimaryButton
        type="submit"
        className="w-full"
        disabled={isLoading || isConfigMissing}
      >
        {isLoading ? "Bezig met inloggen..." : "Inloggen"}
      </PrimaryButton>
    </form>
  );
}
