import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function PlanningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout title="Planning">{children}</DashboardLayout>;
}
