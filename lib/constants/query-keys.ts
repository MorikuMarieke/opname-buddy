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
  patientActivities: {
    all: ["patient-activities"] as const,
  },
  patientDailyParticipation: {
    all: ["patient-daily-participation"] as const,
    byDate: (planDate: string) =>
      ["patient-daily-participation", planDate] as const,
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
    all: ["departments"] as const,
    active: ["departments", "active"] as const,
  },
  planning: {
    dailyParticipation: {
      all: ["planning", "daily-participation"] as const,
      byDate: (planDate: string) =>
        ["planning", "daily-participation", planDate] as const,
    },
    activities: {
      all: ["planning", "activities"] as const,
      detail: (activityId: string) =>
        ["planning", "activities", activityId] as const,
    },
    recurringSchedules: {
      all: ["planning", "recurring-schedules"] as const,
      detail: (scheduleId: string) =>
        ["planning", "recurring-schedules", scheduleId] as const,
    },
    sessions: {
      all: ["planning", "sessions"] as const,
      list: (filters?: {
        status?: string;
        sessionKind?: string;
        from?: string;
        to?: string;
      }) =>
        [
          "planning",
          "sessions",
          filters?.status ?? "all",
          filters?.sessionKind ?? "all",
          filters?.from ?? "default-from",
          filters?.to ?? "default-to",
        ] as const,
      detail: (sessionId: string) =>
        ["planning", "sessions", sessionId] as const,
    },
    patients: {
      all: ["planning", "patients"] as const,
    },
    volunteers: {
      all: ["planning", "volunteers"] as const,
    },
    coordinatorVolunteers: {
      all: ["planning", "coordinator-volunteers"] as const,
    },
    facilitators: {
      candidates: (search?: string) =>
        ["planning", "facilitators", "candidates", search?.trim() ?? ""] as const,
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
    sessions: {
      all: ["volunteer", "sessions"] as const,
    },
    facilitators: {
      sessions: {
        all: ["facilitator", "sessions"] as const,
      },
    },
    availability: {
      recurring: ["volunteer", "availability", "recurring"] as const,
      exceptions: ["volunteer", "availability", "exceptions"] as const,
    },
  },
} as const;

