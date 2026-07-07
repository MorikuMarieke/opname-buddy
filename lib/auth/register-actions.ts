"use server";

import { createClient } from "@/lib/supabase/server";
import { ensurePatientRole } from "@/lib/services/admin-accounts";

export interface RegisterPatientInput {
  fullName: string;
  email: string;
  password: string;
}

export async function registerPatientAccount(
  input: RegisterPatientInput,
): Promise<
  | { ok: true; hasSession: boolean }
  | { error: string }
> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
    },
  });

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Dit e-mailadres is al geregistreerd." };
    }

    if (error.message.includes("Password")) {
      return {
        error: "Het wachtwoord voldoet niet aan de vereisten (minimaal 6 tekens).",
      };
    }

    return { error: "Registreren is mislukt. Probeer het opnieuw." };
  }

  if (data.user) {
    try {
      await ensurePatientRole(data.user.id);
    } catch {
      // handle_new_user trigger assigns patient role when migrations are applied
    }
  }

  return { ok: true, hasSession: Boolean(data.session) };
}
