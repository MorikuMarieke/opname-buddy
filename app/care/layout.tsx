import { CareShell } from "@/components/layout/care-shell";

export default function CareDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CareShell>{children}</CareShell>;
}
