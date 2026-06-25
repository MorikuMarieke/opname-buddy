import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";

const roles = [
  {
    name: "Verpleegkundige",
    description: "Toegang tot zorgdashboard en patiëntinformatie.",
    users: 8,
  },
  {
    name: "Planner",
    description: "Beheer van activiteiten, sessies en vrijwilligers.",
    users: 3,
  },
  {
    name: "Beheerder",
    description: "Volledige toegang tot gebruikers en systeeminstellingen.",
    users: 2,
  },
  {
    name: "Vrijwilliger",
    description: "Inzage in eigen planning en sessies.",
    users: 12,
  },
];

export function AdminRolesView() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Rollen"
        description="Overzicht van rollen en rechten in OpnameBuddy."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <DashboardCard key={role.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-carbon-black">
                  {role.name}
                </h3>
                <p className="mt-1 text-sm text-carbon-black/70">
                  {role.description}
                </p>
              </div>
              <StatusBadge variant="neutral">{role.users} gebruikers</StatusBadge>
            </div>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
