import { PlanningRecurringEditView } from "@/components/dashboard/planning-recurring-edit-view";

interface PlanningRecurringEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanningRecurringEditPage({
  params,
}: PlanningRecurringEditPageProps) {
  const { id } = await params;
  return <PlanningRecurringEditView scheduleId={id} />;
}
