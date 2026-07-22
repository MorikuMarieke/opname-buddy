import type { DailyAdvice } from "@/types/daily-advice";

/**
 * Fixed patient-visible copy for generation / transport failures.
 * Never forward Error.message, provider, tool, or database details.
 */
export const DAILYBUDDY_PATIENT_SAFE_ERROR =
  "Het advies kon op dit moment niet worden gemaakt. Probeer het later opnieuw.";

export const DAILYBUDDY_PATIENT_SAFE_AUTH_ERROR = "Je bent niet ingelogd.";

export const DAILYBUDDY_PATIENT_SAFE_FORBIDDEN_ERROR =
  "Je hebt geen toegang tot deze actie.";

/** Patient-facing advice row: never includes DB `error_message`. */
export type PatientDailyAdvice = Omit<DailyAdvice, "error_message">;

export function toPatientDailyAdvice(advice: DailyAdvice): PatientDailyAdvice {
  const { error_message, ...patientSafe } = advice;
  void error_message;
  return patientSafe;
}

export function toPatientDailyAdviceOrNull(
  advice: DailyAdvice | null,
): PatientDailyAdvice | null {
  return advice ? toPatientDailyAdvice(advice) : null;
}

/**
 * Maps any thrown/unknown error to a fixed patient-safe string.
 * Callers must log the original error server-side when needed.
 */
export function toPatientSafeErrorMessage(error?: unknown): string {
  void error;
  return DAILYBUDDY_PATIENT_SAFE_ERROR;
}

export function patientSafeHttpError(
  status: number,
): string {
  if (status === 401) {
    return DAILYBUDDY_PATIENT_SAFE_AUTH_ERROR;
  }
  if (status === 403) {
    return DAILYBUDDY_PATIENT_SAFE_FORBIDDEN_ERROR;
  }
  return DAILYBUDDY_PATIENT_SAFE_ERROR;
}

export function classifyAdviceApiErrorStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("Niet ingelogd") || message.includes("Alleen")) {
    return 401;
  }
  if (message.includes("alleen beschikbaar")) {
    return 403;
  }
  return 500;
}
