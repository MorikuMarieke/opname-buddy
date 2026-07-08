import { PlanningActivityEditView } from "@/components/dashboard/planning-activity-edit-view";

interface PlanningActivityEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanningActivityEditPage({
  params,
}: PlanningActivityEditPageProps) {
  const { id } = await params;
  return <PlanningActivityEditView activityId={id} />;
}
