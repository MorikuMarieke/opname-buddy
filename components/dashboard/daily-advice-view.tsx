"use client";

import { useEffect, useState } from "react";
import { Sun } from "lucide-react";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PrimaryButton } from "@/components/ui/primary-button";
import { SecondaryButton } from "@/components/ui/secondary-button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  requestDailyAdviceGeneration,
  useDailyAdvice,
  useGenerateDailyAdvice,
} from "@/hooks/use-daily-advice";
import {
  useCancelMorningVisitRequest,
  useCreateMorningVisitRequest,
  useOwnMorningVisitRequest,
} from "@/hooks/use-morning-visit-requests";
import { useTodayCheckIn } from "@/hooks/use-patient-checkins";
import { morningVisitAvailable } from "@/lib/ai/afternoon-gates";
import { PARTICIPATION_BLOCKS } from "@/lib/constants/daily-participation";
import {
  getInspirationLabels,
  VISIT_INSPIRATION_BY_ID,
} from "@/lib/constants/visit-inspirations";
import { formTextareaClasses } from "@/components/forms/form-styles";
import { ADVICE_PRIMARY_OUTCOME_LABELS } from "@/types/daily-advice";
import type { AdvicePrimaryOutcome } from "@/types/daily-advice";

export function DailyAdviceView() {
  const todayCheckIn = useTodayCheckIn();
  const adviceQuery = useDailyAdvice();
  const generateAdvice = useGenerateDailyAdvice();
  const ownRequest = useOwnMorningVisitRequest();
  const createRequest = useCreateMorningVisitRequest();
  const cancelRequest = useCancelMorningVisitRequest();

  const [visitMessage, setVisitMessage] = useState("");
  const [selectedInspirations, setSelectedInspirations] = useState<string[]>(
    [],
  );
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const advice = adviceQuery.data?.advice ?? null;
  const hasCheckIn = Boolean(todayCheckIn.data);

  useEffect(() => {
    if (!hasCheckIn || adviceQuery.isLoading) {
      return;
    }

    if (!advice || advice.status === "stale") {
      requestDailyAdviceGeneration();
      void adviceQuery.refetch();
    }
  }, [hasCheckIn, advice?.status, adviceQuery.isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRetry() {
    try {
      await generateAdvice.mutateAsync(true);
      void adviceQuery.refetch();
    } catch {
      // surfaced via mutation error
    }
  }

  async function handleCreateRequest() {
    setRequestError(null);
    setRequestSuccess(null);

    try {
      await createRequest.mutateAsync({
        patientMessage: visitMessage,
        inspirationIds:
          selectedInspirations.length > 0
            ? selectedInspirations
            : (advice?.inspiration_ids ?? []),
      });
      setRequestSuccess("Je verzoek is verstuurd naar het vrijwilligersteam.");
      setVisitMessage("");
      void ownRequest.refetch();
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Verzoek mislukt.",
      );
    }
  }

  async function handleCancelRequest() {
    if (!ownRequest.data?.id) {
      return;
    }

    setRequestError(null);
    try {
      await cancelRequest.mutateAsync(ownRequest.data.id);
      setRequestSuccess("Je verzoek is geannuleerd.");
      void ownRequest.refetch();
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Annuleren mislukt.",
      );
    }
  }

  function toggleInspiration(id: string) {
    const adviceInspirationIds = advice?.inspiration_ids ?? [];
    setSelectedInspirations((current) => {
      const base =
        current.length > 0 ? current : adviceInspirationIds.slice(0, 4);
      return base.includes(id)
        ? base.filter((item) => item !== id)
        : [...base, id].slice(0, 4);
    });
  }

  if (todayCheckIn.isLoading || adviceQuery.isLoading) {
    return (
      <p className="text-sm text-carbon-black-600">DagBuddy-advies laden...</p>
    );
  }

  if (!hasCheckIn) {
    return (
      <EmptyState
        icon={Sun}
        title="Eerst je check-in invullen"
        description="DagBuddy maakt persoonlijk advies nadat je de check-in van vandaag hebt afgerond."
        size="kiosk"
        action={
          <PrimaryButton href="/dashboard/checkin">Naar check-in</PrimaryButton>
        }
      />
    );
  }

  if (!advice || advice.status === "generating") {
    return (
      <DashboardCard density="comfortable" className="space-y-3">
        <p className="text-base font-medium text-carbon-black-900">
          DagBuddy is je advies aan het maken...
        </p>
        <p className="text-sm text-carbon-black-600">
          Dit duurt even. Je kunt deze pagina open houden; het advies verschijnt
          automatisch.
        </p>
      </DashboardCard>
    );
  }

  if (advice.status === "failed" || advice.status === "stale") {
    return (
      <DashboardCard density="comfortable" className="space-y-4">
        <p className="text-base font-medium text-carbon-black-900">
          {advice.status === "stale"
            ? "Je check-in is bijgewerkt. Maak nieuw advies."
            : "Het advies kon niet worden gemaakt."}
        </p>
        <p className="text-sm text-carbon-black-600">
          Je check-in is wel opgeslagen. Probeer het opnieuw.
        </p>
        {generateAdvice.error ? (
          <p className="text-sm text-red-600" role="alert">
            {generateAdvice.error.message}
          </p>
        ) : null}
        <PrimaryButton
          onClick={() => void handleRetry()}
          disabled={generateAdvice.isPending}
        >
          {generateAdvice.isPending ? "Bezig..." : "Opnieuw proberen"}
        </PrimaryButton>
      </DashboardCard>
    );
  }

  const primary = advice.primary_outcome as AdvicePrimaryOutcome | null;
  const showMorning =
    primary &&
    morningVisitAvailable({
      primaryOutcome: primary,
      secondaryMorningVisit: advice.secondary_morning_visit,
    });
  const inspirationIds = advice.inspiration_ids ?? [];
  const activeInspirationSelection =
    selectedInspirations.length > 0
      ? selectedInspirations
      : inspirationIds.slice(0, 4);

  return (
    <div className="space-y-6">
      <DashboardCard density="comfortable" className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-carbon-black-500">
          Advies voor vandaag
        </p>
        <h2 className="text-2xl font-semibold text-carbon-black-900">
          {primary
            ? ADVICE_PRIMARY_OUTCOME_LABELS[primary]
            : "Participatieadvies"}
        </h2>
        {advice.motivation ? (
          <p className="text-base text-carbon-black-800">{advice.motivation}</p>
        ) : null}
        {advice.explanation ? (
          <p className="text-sm leading-relaxed text-carbon-black-700">
            {advice.explanation}
          </p>
        ) : null}
        {advice.choice_reminder ? (
          <p className="rounded-lg bg-parchment-100 px-4 py-3 text-sm text-carbon-black-800">
            {advice.choice_reminder}
          </p>
        ) : null}
      </DashboardCard>

      {advice.secondary_morning_visit && advice.secondary_morning_note ? (
        <DashboardCard density="compact" className="space-y-2">
          <h3 className="text-lg font-semibold text-carbon-black-900">
            Optioneel: ochtendbezoek
          </h3>
          <p className="text-sm text-carbon-black-700">
            {advice.secondary_morning_note}
          </p>
        </DashboardCard>
      ) : null}

      {advice.afternoon_status === "pending_plan" ? (
        <DashboardCard density="compact">
          <p className="text-sm text-carbon-black-700">
            Er is nog geen middagactiviteit geregistreerd. Als die later wordt
            doorgegeven, zie je hier een update.
          </p>
        </DashboardCard>
      ) : null}

      {advice.afternoon_status === "informational" &&
      advice.afternoon_title ? (
        <DashboardCard density="compact" className="space-y-2">
          <h3 className="text-lg font-semibold text-carbon-black-900">
            Middag {PARTICIPATION_BLOCKS.afternoon.label}
          </h3>
          <p className="text-base font-medium text-carbon-black-900">
            {advice.afternoon_title}
          </p>
          {advice.afternoon_note ? (
            <p className="text-sm text-carbon-black-700">
              {advice.afternoon_note}
            </p>
          ) : null}
        </DashboardCard>
      ) : null}

      {advice.afternoon_status === "recommended" && advice.afternoon_title ? (
        <DashboardCard density="compact" className="space-y-2">
          <h3 className="text-lg font-semibold text-carbon-black-900">
            Middag {PARTICIPATION_BLOCKS.afternoon.label}
          </h3>
          <p className="text-base font-medium text-carbon-black-900">
            {advice.afternoon_title}
          </p>
          {advice.afternoon_note ? (
            <p className="text-sm text-carbon-black-700">
              {advice.afternoon_note}
            </p>
          ) : null}
        </DashboardCard>
      ) : null}

      {showMorning ? (
        <DashboardCard density="comfortable" className="space-y-4">
          <h3 className="text-lg font-semibold text-carbon-black-900">
            Persoonlijk vrijwilligersbezoek
          </h3>
          <p className="text-sm text-carbon-black-700">
            Ochtendblok {PARTICIPATION_BLOCKS.morning.label}. Je doet een
            eenvoudig verzoek; vrijwilligers stemmen onderling af. Er wordt
            niemand automatisch toegewezen.
          </p>

          {inspirationIds.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-carbon-black-900">
                Inspiratie (kies wat bij je past)
              </p>
              <ul className="flex flex-wrap gap-2">
                {inspirationIds.map((id) => {
                  const label =
                    VISIT_INSPIRATION_BY_ID[id]?.labelNl ?? id;
                  const selected = activeInspirationSelection.includes(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => toggleInspiration(id)}
                        className={
                          selected
                            ? "rounded-lg bg-copper-600 px-3 py-2 text-sm text-white"
                            : "rounded-lg border border-parchment-300 bg-white px-3 py-2 text-sm text-carbon-black-800"
                        }
                      >
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {ownRequest.data ? (
            <div className="space-y-3">
              <p className="text-sm text-carbon-black-800">
                Je hebt vandaag een verzoek staan
                {ownRequest.data.patient_message
                  ? `: “${ownRequest.data.patient_message}”`
                  : "."}
              </p>
              {ownRequest.data.inspiration_ids?.length ? (
                <p className="text-sm text-carbon-black-600">
                  Inspiratie:{" "}
                  {getInspirationLabels(ownRequest.data.inspiration_ids).join(
                    ", ",
                  )}
                </p>
              ) : null}
              <SecondaryButton
                onClick={() => void handleCancelRequest()}
                disabled={cancelRequest.isPending}
              >
                Verzoek annuleren
              </SecondaryButton>
            </div>
          ) : (
            <div className="space-y-3">
              <label
                htmlFor="visit_message"
                className="block text-sm font-medium text-carbon-black-900"
              >
                Korte boodschap (optioneel)
              </label>
              <textarea
                id="visit_message"
                value={visitMessage}
                onChange={(event) => setVisitMessage(event.target.value)}
                rows={3}
                maxLength={300}
                className={formTextareaClasses}
                placeholder="Bijvoorbeeld: graag een rustig praatje."
              />
              <PrimaryButton
                onClick={() => void handleCreateRequest()}
                disabled={createRequest.isPending}
              >
                {createRequest.isPending
                  ? "Versturen..."
                  : "Verzoek indienen"}
              </PrimaryButton>
            </div>
          )}

          {requestError ? (
            <p className="text-sm text-red-600" role="alert">
              {requestError}
            </p>
          ) : null}
          {requestSuccess ? (
            <p className="text-sm text-copper-800">{requestSuccess}</p>
          ) : null}
        </DashboardCard>
      ) : null}
    </div>
  );
}

export function DailyAdvicePageContent() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="DagBuddy"
        description="Jouw persoonlijke advies voor participatie vandaag."
        size="kiosk"
      />
      <DailyAdviceView />
    </div>
  );
}
