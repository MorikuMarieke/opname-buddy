import { EditClinicalPatientView } from "@/components/dashboard/care-patient-overview-view";

interface EditClinicalPatientPageProps {
  params: Promise<{ patientId: string }>;
}

export default async function EditClinicalPatientPage({
  params,
}: EditClinicalPatientPageProps) {
  const { patientId } = await params;
  return <EditClinicalPatientView patientId={patientId} />;
}
