"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { FacilitatorSessionsView } from "@/components/dashboard/facilitator-sessions-view";
import { FACILITATOR_COPY } from "@/lib/constants/facilitator-copy";

export function FacilitatorSessionsPageView() {
  const copy = FACILITATOR_COPY.sessions;

  return (
    <div className="space-y-4">
      <SectionHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
        size="compact"
      />
      <FacilitatorSessionsView />
    </div>
  );
}
