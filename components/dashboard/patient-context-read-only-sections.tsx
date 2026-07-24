import { DashboardCard } from "@/components/ui/dashboard-card";
import { PATIENT_CONTEXT_COPY } from "@/lib/constants/patient-context-copy";
import {
  FALL_RISK_LABELS,
  GUIDANCE_LEVEL_LABELS,
  VISIT_ACTIVITY_POSSIBILITY_LABELS,
  ACTIVITY_ROOM_ACCESS_LABELS,
  MOBILITY_AID_AVAILABLE_LABELS,
  MOBILITY_AID_TYPE_LABELS,
  MOBILITY_STATUS_LABELS,
  MOVEMENT_FREEDOM_LABELS,
  TRANSFER_SUPPORT_LABELS,
  ATTENTION_POINT_LABELS,
  type AttentionPoint,
  type PatientContext,
} from "@/types/patient-context";

interface PatientContextReadOnlySectionsProps {
  context: PatientContext | null;
}

function displayEnum<T extends string>(
  value: T,
  labels: Record<T, string>,
): string {
  if (value === "unknown") {
    return PATIENT_CONTEXT_COPY.unknownLabel;
  }

  return labels[value] ?? value;
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-parchment-100 py-2 last:border-0">
      <dt className="text-xs font-medium text-carbon-black-600">{label}</dt>
      <dd className="text-sm text-carbon-black-900">{value}</dd>
    </div>
  );
}

export function PatientContextReadOnlySections({
  context,
}: PatientContextReadOnlySectionsProps) {
  const values = context ?? null;
  const attentionPoints = (values?.additional_attention_points ??
    []) as AttentionPoint[];

  return (
    <DashboardCard density="compact" padding="sm" className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-carbon-black-500">
        {PATIENT_CONTEXT_COPY.sections.core}
      </p>

      <dl className="grid gap-x-4 md:grid-cols-2">
        <ReadOnlyRow
          label="Mobiliteit"
          value={displayEnum(
            (values?.mobility_status ?? "unknown") as never,
            MOBILITY_STATUS_LABELS,
          )}
        />
        <ReadOnlyRow
          label="Transferondersteuning"
          value={displayEnum(
            (values?.transfer_support ?? "unknown") as never,
            TRANSFER_SUPPORT_LABELS,
          )}
        />
        <ReadOnlyRow
          label="Valrisico"
          value={displayEnum(
            (values?.fall_risk ?? "unknown") as never,
            FALL_RISK_LABELS,
          )}
        />
        <ReadOnlyRow
          label="Begeleiding"
          value={displayEnum(
            (values?.requires_supervision ?? "unknown") as never,
            GUIDANCE_LEVEL_LABELS,
          )}
        />
        <ReadOnlyRow
          label="Bewegingsvrijheid"
          value={displayEnum(
            (values?.room_restriction ?? "unknown") as never,
            MOVEMENT_FREEDOM_LABELS,
          )}
        />
        <ReadOnlyRow
          label="Activiteitenruimte zelfstandig bereiken"
          value={displayEnum(
            (values?.can_independently_reach_activity_room ??
              "unknown") as never,
            ACTIVITY_ROOM_ACCESS_LABELS,
          )}
        />
        <ReadOnlyRow
          label="Mogelijkheden voor bezoek en activiteiten"
          value={displayEnum(
            (values?.visit_activity_possibility ?? "unknown") as never,
            VISIT_ACTIVITY_POSSIBILITY_LABELS,
          )}
        />
        {values &&
        (values.mobility_status === "walking_with_aid" ||
          values.mobility_status === "wheelchair") ? (
          <>
            <ReadOnlyRow
              label="Type loophulpmiddel"
              value={displayEnum(
                values.mobility_aid_type as never,
                MOBILITY_AID_TYPE_LABELS,
              )}
            />
            <ReadOnlyRow
              label="Loophulpmiddel beschikbaar"
              value={displayEnum(
                values.mobility_aid_available as never,
                MOBILITY_AID_AVAILABLE_LABELS,
              )}
            />
          </>
        ) : null}
      </dl>

      <p className="border-t border-parchment-200 pt-2 text-xs font-semibold uppercase tracking-wide text-carbon-black-400">
        {PATIENT_CONTEXT_COPY.sections.optional}
      </p>

      <dl>
        <ReadOnlyRow
          label="Aandachtspunten"
          value={
            attentionPoints.length > 0
              ? attentionPoints
                  .map((point) => ATTENTION_POINT_LABELS[point])
                  .join(", ")
              : "—"
          }
        />
        {values?.additional_attention_notes ? (
          <ReadOnlyRow
            label={PATIENT_CONTEXT_COPY.attentionOtherLabel}
            value={values.additional_attention_notes}
          />
        ) : null}
        {values?.notes ? (
          <ReadOnlyRow label="Notities" value={values.notes} />
        ) : null}
      </dl>
    </DashboardCard>
  );
}
