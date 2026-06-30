import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-carbon-black-900">Registreren</h1>
        <p className="text-sm text-carbon-black-600">
          Maak een account aan voor OpnameBuddy.
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-carbon-black-600">
        Heb je al een account?{" "}
        <Link href="/login" className="font-medium text-copper-600 hover:underline">
          Inloggen
        </Link>
      </p>
    </div>
  );
}
