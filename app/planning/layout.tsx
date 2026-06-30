import { PlanningShell } from "@/components/layout/planning-shell";
import { requireRole } from "@/lib/auth/require-role";

export default async function PlanningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("activity_coordinator");

  return <PlanningShell>{children}</PlanningShell>;
}
