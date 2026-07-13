import { PlanningSeriesDetailView } from "@/components/dashboard/planning-series-detail-view";

interface PlanningSeriesDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanningSeriesDetailPage({
  params,
}: PlanningSeriesDetailPageProps) {
  const { id } = await params;
  return <PlanningSeriesDetailView scheduleId={id} />;
}
