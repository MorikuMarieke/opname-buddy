import { SupabaseConfigError } from "@/lib/config/supabase-env";

export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: "E-mailadres of wachtwoord is onjuist.",
  accountInactive:
    "Dit account is gedeactiveerd. Neem contact op met een beheerder als je denkt dat dit niet klopt.",
  configMissing:
    "Inloggen is momenteel niet beschikbaar doordat de applicatieconfiguratie ontbreekt.",
  unknown: "Inloggen is niet gelukt. Probeer het later opnieuw.",
} as const;

export type LoginPageErrorCode = "roles" | "account_inactive" | "config";

const LOGIN_PAGE_ERROR_MESSAGES: Record<LoginPageErrorCode, string> = {
  roles: "Kon je rollen niet ophalen na het inloggen. Probeer het later opnieuw.",
  account_inactive: LOGIN_ERROR_MESSAGES.accountInactive,
  config: LOGIN_ERROR_MESSAGES.configMissing,
};

export function getLoginPageErrorMessage(
  code: string | undefined,
  fallbackMessage?: string,
): string | null {
  if (!code) {
    return null;
  }

  if (code === "roles" && fallbackMessage && process.env.NODE_ENV === "development") {
    console.error("[login] Role resolution failed:", fallbackMessage);
  }

  if (code in LOGIN_PAGE_ERROR_MESSAGES) {
    return LOGIN_PAGE_ERROR_MESSAGES[code as LoginPageErrorCode];
  }

  return null;
}

export function shouldSuppressDuplicateLoginError(
  formError: string,
  pageErrorCode: string | undefined,
): boolean {
  if (!pageErrorCode) {
    return false;
  }

  if (pageErrorCode === "account_inactive") {
    return formError === LOGIN_ERROR_MESSAGES.accountInactive;
  }

  if (pageErrorCode === "config") {
    return formError === LOGIN_ERROR_MESSAGES.configMissing;
  }

  return false;
}

export function mapSupabaseSignInError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("banned") ||
    normalized.includes("user is banned") ||
    normalized.includes("account is disabled")
  ) {
    return LOGIN_ERROR_MESSAGES.accountInactive;
  }

  if (normalized.includes("invalid login credentials")) {
    return LOGIN_ERROR_MESSAGES.invalidCredentials;
  }

  if (
    normalized.includes("no api key") ||
    normalized.includes("apikey") ||
    normalized.includes("invalid api key")
  ) {
    return LOGIN_ERROR_MESSAGES.configMissing;
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[login] Unmapped sign-in error:", message);
  }

  return LOGIN_ERROR_MESSAGES.unknown;
}

export function mapLoginClientError(error: unknown): string {
  if (error instanceof SupabaseConfigError) {
    if (process.env.NODE_ENV === "development") {
      console.error("[login] Supabase configuration error:", error.message);
    }

    return LOGIN_ERROR_MESSAGES.configMissing;
  }

  if (error instanceof TypeError || error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("load failed")
    ) {
      return LOGIN_ERROR_MESSAGES.unknown;
    }

    if (message.includes("no api key") || message.includes("apikey")) {
      return LOGIN_ERROR_MESSAGES.configMissing;
    }
  }

  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    console.error("[login] Unexpected client error:", error.message);
  }

  return LOGIN_ERROR_MESSAGES.unknown;
}
