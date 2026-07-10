import type {
  ActivityAllowedSetting,
  ActivityCategory,
  ActivityIntensity,
  AvailabilityExceptionKind,
  DayOfWeek,
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
  requiresSupervision: boolean;
  requiresVolunteer: boolean;
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

export interface ActivitySessionVolunteer {
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
  volunteerCount: number;
  recurringScheduleId: string | null;
}

/** Volunteer RPC: assigned session with minimal pickup info. */
export interface VolunteerSessionListItem {
  sessionId: string;
  activityTitle: string;
  startsAt: string;
  endsAt: string;
  location: string;
  status: SessionStatus;
  participants: VolunteerSessionParticipantPickup[];
}

export interface VolunteerSessionParticipantPickup {
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
  volunteerNames: string | null;
}

/** Coordinator: volunteer profile summary. */
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
  | "requiresSupervision"
  | "requiresVolunteer"
  | "mobilityNotes"
>;

export type UpdateActivityInput = Partial<CreateActivityInput> & {
  isActive?: boolean;
};
