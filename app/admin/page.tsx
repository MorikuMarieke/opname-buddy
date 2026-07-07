import { AdminOverviewCards } from "@/components/dashboard/admin-overview-cards";
import { SectionHeader } from "@/components/ui/section-header";

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Beheer"
        description="Beheer staffaccounts, rollen en patiëntaccounts."
        size="compact"
      />
      <AdminOverviewCards />
    </div>
  );
}
