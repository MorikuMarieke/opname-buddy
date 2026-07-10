import { PlanningShell } from "@/components/layout/planning-shell";
import { requireRole } from "@/lib/auth/require-role";
import { getCurrentUserProfile } from "@/lib/auth/get-current-user-profile";
import { buildDashboardUserHeader } from "@/lib/utils/dashboard-user-header";

export default async function PlanningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, roles } = await requireRole("activity_coordinator");
  const profile = await getCurrentUserProfile();
  const userHeader = buildDashboardUserHeader(
    user,
    profile,
    roles,
    "activity_coordinator",
  );

  return <PlanningShell userHeader={userHeader}>{children}</PlanningShell>;
}
