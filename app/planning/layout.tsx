import { PlanningShell } from "@/components/layout/planning-shell";

export default function PlanningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlanningShell>{children}</PlanningShell>;
}
