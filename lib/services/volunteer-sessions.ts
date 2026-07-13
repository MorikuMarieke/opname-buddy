import { listFacilitatorSessions } from "@/lib/services/facilitator-sessions";
import type { FacilitatorSessionListItem } from "@/types/activity";

/** @deprecated Use listFacilitatorSessions */
export async function listVolunteerSessions(options?: {
  from?: string;
  to?: string;
}): Promise<FacilitatorSessionListItem[]> {
  return listFacilitatorSessions(options?.from, options?.to);
}
