import { NewAdmissionView } from "@/components/dashboard/new-admission-view";

interface NewAdmissionPageProps {
  params: Promise<{ patientId: string }>;
}

export default async function NewAdmissionPage({ params }: NewAdmissionPageProps) {
  const { patientId } = await params;
  return <NewAdmissionView patientId={patientId} />;
}
