import { AdminShell } from "@/components/layout/admin-shell";
import { requireRole } from "@/lib/auth/require-role";
import { getCurrentUserProfile } from "@/lib/auth/get-current-user-profile";
import { buildDashboardUserHeader } from "@/lib/utils/dashboard-user-header";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, roles } = await requireRole("admin");
  const profile = await getCurrentUserProfile();
  const userHeader = buildDashboardUserHeader(user, profile, roles, "admin");

  return <AdminShell userHeader={userHeader}>{children}</AdminShell>;
}
