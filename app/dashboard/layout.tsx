import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function PatientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout title="Patiënt dashboard">{children}</DashboardLayout>;
}
