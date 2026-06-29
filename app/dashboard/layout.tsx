import { PatientShell } from "@/components/layout/patient-shell";

export default function PatientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PatientShell>{children}</PatientShell>;
}
