import { PatientShell } from "@/components/layout/patient-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function PatientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await requireRole("patient");

  return <PatientShell user={user}>{children}</PatientShell>;
}
