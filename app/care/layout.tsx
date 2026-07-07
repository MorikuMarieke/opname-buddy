import { CareShell } from "@/components/layout/care-shell";
import { requireRole } from "@/lib/auth/require-role";
import { getCurrentUserProfile } from "@/lib/auth/get-current-user-profile";
import { buildDashboardUserHeader } from "@/lib/utils/dashboard-user-header";

export default async function CareDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, roles } = await requireRole("caregiver");
  const profile = await getCurrentUserProfile();
  const userHeader = buildDashboardUserHeader(user, profile, roles);

  return <CareShell userHeader={userHeader}>{children}</CareShell>;
}
