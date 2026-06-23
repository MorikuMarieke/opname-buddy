import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardLayout title="Admin dashboard">{children}</DashboardLayout>;
}
