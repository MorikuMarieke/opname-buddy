import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function CareDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout title="Zorg dashboard">{children}</DashboardLayout>;
}
