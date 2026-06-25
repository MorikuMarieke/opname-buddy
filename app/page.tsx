import { Heart, LayoutDashboard, Settings, Users } from "lucide-react";
import { OpnameBuddyLogo } from "@/components/layout/opname-buddy-logo";
import { ActionTile } from "@/components/ui/action-tile";
import { DashboardCard } from "@/components/ui/dashboard-card";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-parchment">
      <header className="border-b border-dust-grey bg-white px-6 py-5">
        <OpnameBuddyLogo />
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pearl-aqua/50 text-blue-slate">
            <Heart className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="text-3xl font-semibold text-carbon-black">
            Welkom bij OpnameBuddy
          </h1>
          <p className="text-carbon-black/70">
            Herstelparticipatie platform voor gehospitaliseerde patiënten.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ActionTile
            href="/dashboard"
            icon={Heart}
            title="Patiënt dashboard"
            description="Dagelijks herstel en participatie."
            accent="copper"
          />
          <ActionTile
            href="/care"
            icon={Users}
            title="Zorg dashboard"
            description="Overzicht voor het zorgteam."
            accent="blue-slate"
          />
          <ActionTile
            href="/planning"
            icon={LayoutDashboard}
            title="Planning"
            description="Activiteiten en vrijwilligers."
            accent="pearl-aqua"
          />
          <ActionTile
            href="/admin"
            icon={Settings}
            title="Beheer"
            description="Gebruikers en rollen."
            accent="blue-slate"
          />
        </div>

        <DashboardCard className="mt-6 text-center">
          <p className="text-sm text-carbon-black/70">
            Ontwikkelaarsnavigatie — kies een module om de visuele basis te bekijken.
          </p>
        </DashboardCard>
      </main>
    </div>
  );
}
