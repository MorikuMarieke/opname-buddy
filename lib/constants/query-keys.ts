export const queryKeys = {
  checkIns: {
    all: ["check-ins"] as const,
    today: () => [...queryKeys.checkIns.all, "today"] as const,
    recent: (limit: number) =>
      [...queryKeys.checkIns.all, "recent", limit] as const,
  },
  questions: {
    all: ["questions"] as const,
  },
  participationEvaluations: {
    all: ["participation-evaluations"] as const,
    today: () =>
      [...queryKeys.participationEvaluations.all, "today"] as const,
    recent: (limit: number) =>
      [...queryKeys.participationEvaluations.all, "recent", limit] as const,
  },
  patientContext: {
    all: ["patient-context"] as const,
    byPatient: (patientId: string) =>
      [...queryKeys.patientContext.all, patientId] as const,
    byAdmission: (admissionId: string) =>
      [...queryKeys.patientContext.all, "admission", admissionId] as const,
    own: () => [...queryKeys.patientContext.all, "own"] as const,
  },
  adminAccounts: {
    all: ["admin-accounts"] as const,
    staff: (filters?: { search?: string; status?: string }) =>
      [...queryKeys.adminAccounts.all, "staff", filters ?? {}] as const,
    patients: (filters?: { linkStatus?: string }) =>
      [...queryKeys.adminAccounts.all, "patients", filters ?? {}] as const,
    detail: (userId: string) =>
      [...queryKeys.adminAccounts.all, "detail", userId] as const,
  },
  adminRoles: {
    all: ["admin-roles"] as const,
  },
  adminOverview: {
    all: ["admin-overview"] as const,
    audit: (limit: number) =>
      [...queryKeys.adminOverview.all, "audit", limit] as const,
  },
  carePatients: {
    all: ["care-patients"] as const,
  },
} as const;

