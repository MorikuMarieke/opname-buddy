import { PlanningSessionDetailView } from "@/components/dashboard/planning-session-detail-view";

interface PlanningSessionDetailPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function PlanningSessionDetailPage({
  params,
}: PlanningSessionDetailPageProps) {
  const { sessionId } = await params;
  return <PlanningSessionDetailView sessionId={sessionId} />;
}
