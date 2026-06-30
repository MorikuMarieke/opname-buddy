import { createClient } from "@/lib/supabase/server";
import { PatientHomeView } from "@/components/dashboard/patient-home-view";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <PatientHomeView user={user!} />;
}
