import { Heart, HandHeart, LayoutDashboard, Settings, Users } from "lucide-react";
import { OpnameBuddyLogo } from "@/components/layout/opname-buddy-logo";
import { ActionTile } from "@/components/ui/action-tile";
import { DashboardCard } from "@/components/ui/dashboard-card";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-parchment-50">
      <header className="border-b border-parchment-200 bg-white px-6 py-5">
        <OpnameBuddyLogo />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pearl-aqua-200 text-pearl-aqua-800">
            <Heart className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-3xl font-semibold text-carbon-black-900">
            Welkom bij OpnameBuddy
          </h1>
          <p className="text-carbon-black-600">
            Herstelparticipatie platform voor gehospitaliseerde patiënten.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionTile
            href="/dashboard"
            icon={Heart}
            title="Patiënt dashboard"
            description="Dagelijks herstel en participatie."
            accent="copper"
            size="default"
          />
          <ActionTile
            href="/care"
            icon={Users}
            title="Zorg dashboard"
            description="Overzicht voor het zorgteam."
            accent="blue-slate"
            size="default"
          />
          <ActionTile
            href="/planning"
            icon={LayoutDashboard}
            title="Planning"
            description="Activiteiten en vrijwilligers."
            accent="pearl-aqua"
            size="default"
          />
          <ActionTile
            href="/volunteer"
            icon={HandHeart}
            title="Vrijwilliger"
            description="Eigen planning en beschikbaarheid."
            accent="copper"
            size="default"
          />
          <ActionTile
            href="/admin"
            icon={Settings}
            title="Beheer"
            description="Gebruikers en rollen."
            accent="blue-slate"
            size="default"
          />
          <ActionTile
            href="/login"
            icon={Users}
            title="Inloggen"
            description="Bestaand account gebruiken."
            accent="pearl-aqua"
            size="default"
          />
        </div>

        <DashboardCard className="mt-6 text-center" density="comfortable">
          <p className="text-sm text-carbon-black-600">
            Ontwikkelaarsnavigatie — snelle links naar alle modules op localhost.
          </p>
        </DashboardCard>
      </main>
    </div>
  );
}
