import type {
  ActivityAllowedSetting,
  ActivityCategory,
  ActivityIntensity,
  AvailabilityExceptionKind,
  DayOfWeek,
  RecurringIntervalWeeks,
  SessionKind,
  SessionStatus,
} from "@/lib/constants/planning-enums";

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  intensity: ActivityIntensity;
  location: string | null;
  allowedSettings: ActivityAllowedSetting[];
  defaultDurationMinutes: number | null;
  minParticipants: number;
  maxParticipants: number;
  mobilityNotes: string | null;
  isActive: boolean;
  createdByStaffId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityRecurringSchedule {
  id: string;
  activityId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  location: string | null;
  minParticipants: number | null;
  maxParticipants: number | null;
  intervalWeeks: RecurringIntervalWeeks;
  seriesStartsOn: string;
  seriesEndsOn: string;
  endedAt: string | null;
  isActive: boolean;
  createdByStaffId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySession {
  id: string;
  activityId: string;
  recurringScheduleId: string | null;
  sessionKind: SessionKind;
  startsAt: string;
  endsAt: string;
  location: string;
  minParticipants: number;
  maxParticipants: number;
  status: SessionStatus;
  notes: string | null;
  recurringOccurrenceDate: string | null;
  isDetached: boolean;
  confirmedAt: string | null;
  confirmedByStaffId: string | null;
  createdByStaffId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitySessionParticipant {
  sessionId: string;
  admissionId: string;
  assignedAt: string;
  assignedByStaffId: string | null;
}

export interface ActivitySessionFacilitator {
  sessionId: string;
  userId: string;
  assignedAt: string;
  assignedByStaffId: string | null;
}

export interface VolunteerRecurringAvailability {
  id: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerAvailabilityException {
  id: string;
  userId: string;
  exceptionDate: string;
  startTime: string;
  endTime: string;
  kind: AvailabilityExceptionKind;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Coordinator RPC: active admissions for patient assignment. */
export interface PlanningPatientListItem {
  admissionId: string;
  patientDisplayName: string;
  departmentId: string | null;
  departmentName: string | null;
  roomNumber: string | null;
}

/** Coordinator RPC: denormalized session row for overview/lists. */
export interface PlanningSessionListItem {
  sessionId: string;
  activityId: string;
  activityTitle: string;
  activityDescription: string;
  activityCategory: ActivityCategory;
  activityIntensity: ActivityIntensity;
  sessionKind: SessionKind;
  status: SessionStatus;
  startsAt: string;
  endsAt: string;
  location: string;
  minParticipants: number;
  maxParticipants: number;
  participantCount: number;
  facilitatorCount: number;
  recurringScheduleId: string | null;
  isDetached: boolean;
}

/** Facilitator RPC: assigned session with minimal pickup info when confirmed. */
export interface FacilitatorSessionListItem {
  sessionId: string;
  activityTitle: string;
  activityDescription: string;
  startsAt: string;
  endsAt: string;
  location: string;
  status: SessionStatus;
  participantCount: number;
  participants: FacilitatorSessionParticipantPickup[];
}

export interface FacilitatorSessionParticipantPickup {
  displayName: string;
  departmentName: string | null;
  roomNumber: string | null;
}

/** Patient RPC: confirmed upcoming session. */
export interface PatientActivitySessionListItem {
  sessionId: string;
  activityTitle: string;
  activityDescription: string;
  startsAt: string;
  endsAt: string;
  location: string;
  facilitatorNames: string | null;
}

/** Coordinator: eligible facilitator account for assignment picker. */
export interface PlanningFacilitatorCandidate {
  userId: string;
  fullName: string | null;
  roleNames: string[];
}

/** Coordinator: volunteer profile summary (availability view). */
export interface PlanningVolunteerListItem {
  userId: string;
  fullName: string | null;
  volunteerBio: string | null;
}

export type CreateActivityInput = Pick<
  Activity,
  | "title"
  | "description"
  | "category"
  | "intensity"
  | "location"
  | "allowedSettings"
  | "defaultDurationMinutes"
  | "minParticipants"
  | "maxParticipants"
  | "mobilityNotes"
>;

export type UpdateActivityInput = Partial<CreateActivityInput> & {
  isActive?: boolean;
};
