import { PatientContextView } from "@/components/dashboard/patient-context-view";

interface CarePatientContextPageProps {
  params: Promise<{ patientId: string }>;
}

export default async function CarePatientContextPage({
  params,
}: CarePatientContextPageProps) {
  const { patientId } = await params;

  return <PatientContextView patientId={patientId} />;
}
