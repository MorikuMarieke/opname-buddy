import { CareShell } from "@/components/layout/care-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function CareDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("caregiver");

  return <CareShell>{children}</CareShell>;
}
