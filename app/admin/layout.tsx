import { AdminShell } from "@/components/layout/admin-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("admin");

  return <AdminShell>{children}</AdminShell>;
}
