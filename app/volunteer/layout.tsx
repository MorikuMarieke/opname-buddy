import { VolunteerShell } from "@/components/layout/volunteer-shell";
import { requireRole } from "@/lib/auth/require-role";
import { getCurrentUserProfile } from "@/lib/auth/get-current-user-profile";
import { buildDashboardUserHeader } from "@/lib/utils/dashboard-user-header";

export default async function VolunteerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, roles } = await requireRole("volunteer");
  const profile = await getCurrentUserProfile();
  const userHeader = buildDashboardUserHeader(user, profile, roles);

  return <VolunteerShell userHeader={userHeader}>{children}</VolunteerShell>;
}
