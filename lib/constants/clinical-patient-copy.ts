import type { PatientSex } from "@/types/clinical-patient";

export const PATIENT_SEX_OPTIONS: { value: PatientSex; label: string }[] = [
  { value: "M", label: "Man (M)" },
  { value: "F", label: "Vrouw (F)" },
  { value: "X", label: "X (neutraal)" },
];

export const CLINICAL_PATIENT_COPY = {
  admitPatient: "Patiënt opnemen",
  newAdmission: "Nieuwe opname",
  editPatient: "Gegevens bewerken",
  discharge: "Ontslag",
  dischargeConfirmTitle: "Opname beëindigen?",
  dischargeConfirmBody:
    "De patiënt krijgt geen actieve opname meer. Zorggegevens van dit verblijf blijven bewaard. Je kunt later een nieuwe opname starten.",
  dischargeConfirmAction: "Opname beëindigen",
  expectedDischargeLabel: "Verwachte ontslagdatum",
  expectedDischargeHint:
    "Indicatieve datum voor planning. Dit is geen garantie en kan nog wijzigen.",
  expectedDischargePatientHint:
    "Deze datum is een indicatie en kan nog wijzigen.",
  admittedOnLabel: "Opnamedatum",
  activeAdmission: "Actieve opname",
  noActiveAdmission: "Geen actieve opname",
  accountLinked: "Account gekoppeld",
  accountNotLinked: "Account niet gekoppeld",
  generateLinkCode: "Koppelcode genereren",
  linkCodeTitle: "Koppelcode voor patiënt",
  linkCodeShownOnce:
    "Deze code wordt één keer getoond. Noteer hem en geef hem aan de patiënt.",
  linkCodeExpiry: "Geldig tot",
  linkCodeInstructions:
    "De patiënt registreert zich of logt in en voert deze code in op het dashboard.",
  strongMatch: "Sterke overeenkomst",
  possibleMatch: "Mogelijke overeenkomst",
  duplicateSearchHint:
    "Controleer eerst of deze patiënt al in het systeem staat.",
  duplicateDisclaimer:
    "OpnameBuddy gebruikt basisnaam-matching. In een ziekenhuisomgeving wordt duplicaatpreventie normaal via het EPD of een betrouwbare patiëntidentifier afgehandeld.",
  continueNewPatient: "Toch nieuwe patiënt opnemen",
  openPatient: "Patiënt openen",
  startNewAdmission: "Nieuwe opname starten",
  noActiveAdmissionPatient:
    "Je hebt momenteel geen actieve opname. Neem contact op met je zorgverlener.",
  patientAdmissionLocationTitle: "Je opname",
  patientDepartmentLabel: "Afdeling",
  patientRoomLabel: "Kamer",
  patientDepartmentUnknown: "Nog niet vastgelegd",
  linkAccountTitle: "Account koppelen",
  linkAccountDescription:
    "Voer de 6-cijferige code in die je van je zorgverlener hebt gekregen.",
  linkCodeLabel: "Koppelcode",
  linkCodeSubmit: "Koppelen",
  linkCodeInvalid: "Ongeldige of verlopen koppelcode.",
  linkCodeAlreadyLinked: "Je account is al gekoppeld aan een patiënt.",
  savePatient: "Opslaan",
  createAdmission: "Opname starten",
  cancel: "Annuleren",
  firstName: "Voornaam",
  lastName: "Achternaam",
  birthDate: "Geboortedatum",
  sex: "Geslacht",
  patientDetails: "Patiëntgegevens",
  admissionDetails: "Opname",
} as const;
