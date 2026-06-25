interface PatientDetailPageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDetailPage({
  params,
}: PatientDetailPageProps) {
  const { patientId } = await params;

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Patiënt {patientId}</h2>
      <p className="text-zinc-600">Placeholder — nog te implementeren.</p>
    </div>
  );
}
