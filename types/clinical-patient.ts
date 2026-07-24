import type { Admission, Patient } from "@/types/database";

export type PatientSex = "M" | "F" | "X";

export type PatientMatchTier = "strong" | "possible";

export type PatientAdmissionStatus = "active" | "none";

/** Client-side filter for caregiver patient lists (admission-based). */
export type CareAdmissionFilter = "all" | PatientAdmissionStatus;

export type ClinicalPatient = Patient;

export type ClinicalAdmission = Admission;

export interface CarePatientListItem {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  sex: PatientSex | null;
  admissionId: string | null;
  expectedDischargeOn: string | null;
  userId: string | null;
}

export interface PatientDemographicsInput {
  firstName: string;
  lastName: string;
  birthDate: string | null;
  sex: PatientSex;
}

export interface AdmissionInput {
  admittedOn: string;
  departmentId: string;
  roomNumber?: string | null;
  expectedDischargeOn?: string | null;
}

export interface AdmissionWithDepartment extends Admission {
  departmentName: string | null;
}

export interface PatientDemographicMatch {
  patientId: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  sex: PatientSex | null;
  matchTier: PatientMatchTier;
  admissionStatus: PatientAdmissionStatus;
  admissionId: string | null;
  userId: string | null;
}

export interface PatientLinkCodeResult {
  code: string;
  expiresAt: string;
}

export interface PatientLinkStatus {
  isLinked: boolean;
  userId: string | null;
}
