import { CarePatientDetailView } from "@/components/dashboard/care-patient-detail-view";

interface CarePatientRecoveryContextPageProps {
  params: Promise<{ patientId: string }>;
}

const patientNames: Record<string, { name: string; room: string }> = {
  "jan-de-vries": { name: "Jan de Vries", room: "204" },
  "maria-jansen": { name: "Maria Jansen", room: "112" },
  "pieter-bakker": { name: "Pieter Bakker", room: "308" },
  "els-vermeer": { name: "Els Vermeer", room: "215" },
};

export default async function CarePatientRecoveryContextPage({
  params,
}: CarePatientRecoveryContextPageProps) {
  const { patientId } = await params;
  const patient = patientNames[patientId] ?? {
    name: "Onbekende patiënt",
    room: "—",
  };

  return (
    <CarePatientDetailView
      patientId={patientId}
      patientName={patient.name}
      room={patient.room}
      variant="recovery-context"
    />
  );
}
