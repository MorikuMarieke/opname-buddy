import { Plus } from "lucide-react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";

const users = [
  { name: "Sanne de Vries", email: "sanne@ziekenhuis.nl", role: "Verpleegkundige", active: true },
  { name: "Mark de Boer", email: "mark@ziekenhuis.nl", role: "Planner", active: true },
  { name: "Anna Smit", email: "anna@ziekenhuis.nl", role: "Beheerder", active: true },
  { name: "Lisa van Dijk", email: "lisa@ziekenhuis.nl", role: "Vrijwilliger", active: false },
];

export function AdminUsersView() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Gebruikers"
        description="Beheer gebruikers en toegang tot OpnameBuddy."
        size="compact"
        action={
          <PrimaryButton size="sm" icon={<Plus className="h-4 w-4" />}>
            Gebruiker toevoegen
          </PrimaryButton>
        }
      />

      <DashboardCard density="compact" className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-dust-grey-200 text-carbon-black-600">
              <th className="px-3 py-2 font-medium">Naam</th>
              <th className="px-3 py-2 font-medium">E-mail</th>
              <th className="px-3 py-2 font-medium">Rol</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.email}
                className="border-b border-dust-grey-100 last:border-0"
              >
                <td className="px-3 py-2 font-medium text-carbon-black-900">
                  {user.name}
                </td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">{user.role}</td>
                <td className="px-3 py-2">
                  <StatusBadge variant={user.active ? "positive" : "neutral"}>
                    {user.active ? "Actief" : "Inactief"}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardCard>
    </div>
  );
}
