import { CarePatientOverviewView } from "@/components/dashboard/care-patient-overview-view";

interface CarePatientDetailPageProps {
  params: Promise<{ patientId: string }>;
}

export default async function CarePatientDetailPage({
  params,
}: CarePatientDetailPageProps) {
  const { patientId } = await params;

  return <CarePatientOverviewView patientId={patientId} />;
}
