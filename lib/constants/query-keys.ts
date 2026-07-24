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
    byAdmission: (admissionId: string) =>
      [...queryKeys.patientContext.all, "admission", admissionId] as const,
    own: () => [...queryKeys.patientContext.all, "own"] as const,
  },
  dailyAdvice: {
    all: ["daily-advice"] as const,
    today: () => [...queryKeys.dailyAdvice.all, "today"] as const,
  },
  morningVisitRequests: {
    all: ["morning-visit-requests"] as const,
    own: () => [...queryKeys.morningVisitRequests.all, "own"] as const,
    byDate: (requestDate: string) =>
      [...queryKeys.morningVisitRequests.all, "date", requestDate] as const,
  },
  afternoonInterest: {
    all: ["afternoon-interest"] as const,
    own: () => [...queryKeys.afternoonInterest.all, "own"] as const,
    byDate: (interestDate: string) =>
      [...queryKeys.afternoonInterest.all, "date", interestDate] as const,
    count: (interestDate: string) =>
      [...queryKeys.afternoonInterest.all, "count", interestDate] as const,
  },
  adminAccounts: {
    all: ["admin-accounts"] as const,
    staff: (filters?: { search?: string; status?: string; role?: string }) => {
      const search = filters?.search?.trim() ?? "";
      const status = filters?.status ?? "all";
      const role = filters?.role ?? "";

      return [
        ...queryKeys.adminAccounts.all,
        "staff",
        search,
        status,
        role,
      ] as const;
    },
    patients: (filters?: { linkStatus?: string }) => {
      const linkStatus = filters?.linkStatus ?? "all";

      return [...queryKeys.adminAccounts.all, "patients", linkStatus] as const;
    },
    volunteers: (filters?: { search?: string; status?: string }) => {
      const search = filters?.search?.trim() ?? "";
      const status = filters?.status ?? "all";

      return [
        ...queryKeys.adminAccounts.all,
        "volunteers",
        search,
        status,
      ] as const;
    },
    detail: (userId: string) =>
      [...queryKeys.adminAccounts.all, "detail", userId] as const,
    audit: (userId: string, limit: number) =>
      [...queryKeys.adminAccounts.all, "audit", userId, limit] as const,
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
    search: (filters: { firstName: string; lastName: string; birthDate?: string }) =>
      [
        ...queryKeys.carePatients.all,
        "search",
        filters.firstName,
        filters.lastName,
        filters.birthDate ?? "",
      ] as const,
  },
  clinicalPatients: {
    all: ["clinical-patients"] as const,
    detail: (patientId: string) =>
      [...queryKeys.clinicalPatients.all, "detail", patientId] as const,
    admission: (patientId: string) =>
      [...queryKeys.clinicalPatients.all, "admission", patientId] as const,
    linkStatus: (patientId: string) =>
      [...queryKeys.clinicalPatients.all, "link-status", patientId] as const,
  },
  activeAdmission: {
    own: () => ["active-admission", "own"] as const,
    location: () => ["active-admission", "location"] as const,
  },
  patientLink: {
    own: () => ["patient-link", "own"] as const,
  },
  departments: {
    active: ["departments", "active"] as const,
  },
  planning: {
    dailyParticipation: {
      all: ["planning", "daily-participation"] as const,
      byDate: (planDate: string) =>
        ["planning", "daily-participation", planDate] as const,
    },
    coordinatorVolunteerOverview: {
      all: ["planning", "coordinator-volunteer-overview"] as const,
      byDate: (planDate: string, yearMonth: string) =>
        [
          "planning",
          "coordinator-volunteer-overview",
          planDate,
          yearMonth,
        ] as const,
    },
  },
  volunteer: {
    profile: ["volunteer", "profile"] as const,
    dailyParticipation: {
      all: ["volunteer", "daily-participation"] as const,
      byDate: (planDate: string) =>
        ["volunteer", "daily-participation", planDate] as const,
    },
    blockAvailability: {
      weekly: ["volunteer", "block-availability", "weekly"] as const,
      absences: (yearMonth: string) =>
        ["volunteer", "block-availability", "absences", yearMonth] as const,
    },
  },
} as const;
