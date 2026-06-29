import { redirect } from "next/navigation";

import { PatientShell } from "@/components/layout/patient-shell";
import { createClient } from "@/lib/supabase/server";

export default async function PatientDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <PatientShell user={user}>{children}</PatientShell>;
}
