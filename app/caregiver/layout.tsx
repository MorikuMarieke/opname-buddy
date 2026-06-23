import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function CaregiverDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardLayout title="Zorgverlener dashboard">{children}</DashboardLayout>
  );
}
