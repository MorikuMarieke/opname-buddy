"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PrimaryButton } from "@/components/ui/primary-button";
import { FormField } from "@/components/forms/form-field";
import { useRedeemLinkCode } from "@/hooks/use-redeem-link-code";
import { CLINICAL_PATIENT_COPY } from "@/lib/constants/clinical-patient-copy";
import { redeemLinkCodeSchema } from "@/lib/validations/clinical-patient";

const inputClasses =
  "h-11 w-full rounded-xl border border-dust-grey-200 bg-parchment-50 px-4 text-center text-lg tracking-[0.3em] text-carbon-black-900";

export function PatientLinkCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const redeemMutation = useRedeemLinkCode();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = redeemLinkCodeSchema.safeParse({ code });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ongeldige code.");
      return;
    }

    try {
      await redeemMutation.mutateAsync(parsed.data.code);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : CLINICAL_PATIENT_COPY.linkCodeInvalid);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label={CLINICAL_PATIENT_COPY.linkCodeLabel} htmlFor="linkCode">
        <input
          id="linkCode"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className={inputClasses}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      </FormField>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <PrimaryButton type="submit" disabled={redeemMutation.isPending}>
        {redeemMutation.isPending ? "Koppelen..." : CLINICAL_PATIENT_COPY.linkCodeSubmit}
      </PrimaryButton>
    </form>
  );
}
