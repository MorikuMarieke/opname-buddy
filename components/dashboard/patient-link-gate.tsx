"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PatientLinkCodeForm } from "@/components/forms/patient-link-code-form";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { SectionHeader } from "@/components/ui/section-header";
import { useOwnLinkStatus } from "@/hooks/use-patient-link-status";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";

export function PatientLinkGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: linkStatus, isLoading } = useOwnLinkStatus();

  useEffect(() => {
    if (!isLoading && linkStatus && !linkStatus.isLinked) {
      router.replace("/dashboard/link");
    }
  }, [isLoading, linkStatus, router]);

  if (isLoading) {
    return (
      <div className="px-4 py-8 text-sm text-carbon-black-600">
        Accountstatus laden...
      </div>
    );
  }

  if (!linkStatus?.isLinked) {
    return null;
  }

  return children;
}

export function PatientLinkPageView() {
  const router = useRouter();
  const { data: linkStatus, isLoading } = useOwnLinkStatus();

  useEffect(() => {
    if (!isLoading && linkStatus?.isLinked) {
      router.replace("/dashboard");
    }
  }, [isLoading, linkStatus, router]);

  if (isLoading) {
    return <p className="text-sm text-carbon-black-600">Laden...</p>;
  }

  if (linkStatus?.isLinked) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <SectionHeader
        title={CLINICAL_PATIENT_COPY.linkAccountTitle}
        description={CLINICAL_PATIENT_COPY.linkAccountDescription}
        size="compact"
      />
      <DashboardCard density="comfortable" padding="lg">
        <PatientLinkCodeForm />
      </DashboardCard>
    </div>
  );
}
