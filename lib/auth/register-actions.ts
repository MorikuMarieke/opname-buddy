"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ensurePatientRole } from "@/lib/services/admin-accounts";

export interface RegisterPatientInput {
  fullName: string;
  email: string;
  password: string;
}

function mapRegisterError(error: {
  message: string;
  code?: string;
}): string {
  const message = error.message.toLowerCase();
  const code = error.code ?? "";

  if (
    code === "over_email_send_rate_limit" ||
    message.includes("rate limit")
  ) {
    return "Te veel e-mails verstuurd. Wacht even en probeer het later opnieuw.";
  }

  if (
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("user already exists") ||
    message.includes("duplicate") ||
    code === "email_exists" ||
    code === "user_already_exists"
  ) {
    return "Dit e-mailadres is al geregistreerd.";
  }

  if (message.includes("password")) {
    return "Het wachtwoord voldoet niet aan de vereisten (minimaal 6 tekens).";
  }

  return "Registreren is mislukt. Probeer het opnieuw.";
}

export async function registerPatientAccount(
  input: RegisterPatientInput,
): Promise<
  | { ok: true; hasSession: boolean }
  | { error: string }
> {
  const admin = createAdminClient();
  const supabase = await createClient();

  // Create a confirmed user via service role so signup does not send a
  // confirmation email (avoids Supabase built-in SMTP rate limits).
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      account_type: "patient",
    },
  });

  if (error || !data.user) {
    return {
      error: mapRegisterError(
        error ?? { message: "Registreren is mislukt. Probeer het opnieuw." },
      ),
    };
  }

  try {
    await ensurePatientRole(data.user.id);
  } catch {
    // handle_new_user trigger assigns patient role when migrations are applied
  }

  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

  if (signInError || !signInData.session) {
    return {
      error:
        "Account aangemaakt, maar automatisch inloggen mislukte. Log handmatig in.",
    };
  }

  return { ok: true, hasSession: true };
}
