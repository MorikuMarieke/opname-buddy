import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-carbon-black-900">Inloggen</h1>
        <p className="text-sm text-carbon-black-600">
          Log in om verder te gaan met OpnameBuddy.
        </p>
      </div>

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
