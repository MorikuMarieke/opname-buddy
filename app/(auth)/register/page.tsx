import Link from "next/link";
import { PrimaryButton } from "@/components/ui/primary-button";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-carbon-black">Registreren</h1>
        <p className="text-sm text-carbon-black/70">
          Maak een account aan voor OpnameBuddy.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-carbon-black"
          >
            Naam
          </label>
          <input
            id="name"
            type="text"
            disabled
            placeholder="Jouw naam"
            className="h-11 w-full rounded-xl border border-dust-grey bg-parchment px-4 text-sm text-carbon-black placeholder:text-carbon-black/40"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-carbon-black"
          >
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            disabled
            placeholder="naam@voorbeeld.nl"
            className="h-11 w-full rounded-xl border border-dust-grey bg-parchment px-4 text-sm text-carbon-black placeholder:text-carbon-black/40"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-carbon-black"
          >
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            disabled
            placeholder="••••••••"
            className="h-11 w-full rounded-xl border border-dust-grey bg-parchment px-4 text-sm text-carbon-black placeholder:text-carbon-black/40"
          />
        </div>
      </div>

      <div className="space-y-3">
        <PrimaryButton className="w-full">Account aanmaken</PrimaryButton>
        <p className="text-center text-sm text-carbon-black/70">
          Heb je al een account?{" "}
          <Link href="/login" className="font-medium text-copper hover:underline">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
