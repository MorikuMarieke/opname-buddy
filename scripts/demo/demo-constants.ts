import type { ParticipationNeedValue } from "../../lib/constants/daily-participation";
import type {
  AttentionPoint,
  FallRisk,
  GuidanceLevel,
  MobilityAidAvailable,
  MobilityAidType,
  MobilityStatus,
  MovementFreedom,
  TransferSupport,
} from "../../types/patient-context";

export const DEMO_EMAIL_DOMAIN = "@opnamebuddy.test";
export const DEMO_PASSWORD = "Demo123!";
export const DEMO_PATIENT_REF_PREFIX = "DEMO-PAT-";

export type DemoStaffRole =
  | "admin"
  | "activity_coordinator"
  | "caregiver"
  | "volunteer"
  | "patient";

export type DemoPreferredActivityType = ParticipationNeedValue;

export interface DemoStaffAccountDefinition {
  email: string;
  fullName: string;
  roles: Exclude<DemoStaffRole, "patient" | "volunteer">[];
  accountType: "staff";
}

export interface DemoVolunteerAccountDefinition {
  email: string;
  fullName: string;
  personality: string;
  preferredActivityType: DemoPreferredActivityType;
  bio: string;
  weeklyBlocks: Array<{
    dayOfWeek: number;
    morningAvailable: boolean;
    afternoonAvailable: boolean;
  }>;
  absences: Array<{
    dayOffset: number;
    block: "morning" | "afternoon";
  }>;
  /** Optional absence on today's first normally-available block (Hugo). */
  absenceTodayFirstBlock?: boolean;
}

export interface DemoPatientAccountDefinition {
  email: string;
  displayName: string;
}

export interface DemoPatientScenario {
  ref: string;
  accountEmail: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: "M" | "F" | "X";
  departmentName: string;
  roomNumber: string;
  admissionReason: string;
  daysAdmittedAgo: number;
  expectedDischargeOffsetDays?: number;
  context: {
    mobilityStatus: MobilityStatus;
    transferSupport: TransferSupport;
    fallRisk: FallRisk;
    requiresSupervision: GuidanceLevel;
    mobilityAidType: MobilityAidType;
    mobilityAidAvailable: MobilityAidAvailable;
    roomRestriction: MovementFreedom;
    additionalAttentionPoints: AttentionPoint[];
    notes: string;
  };
  checkIn: {
    painScore: number;
    energyLevel: number;
    mood: number;
    mobilityLevel: number;
    motivationScore: number;
    participationNeeds: ParticipationNeedValue[];
    symptoms: string;
    note: string;
  };
  archetype?: string;
}

export interface DemoDailyPlanDefinition {
  dayOffset: number;
  recordedByEmail: string;
  afternoonCategory: ParticipationNeedValue;
  afternoonTitle: string;
  participantMessage: string;
}

export const DEMO_STAFF_ACCOUNTS: DemoStaffAccountDefinition[] = [
  {
    email: "admin.demo@opnamebuddy.test",
    fullName: "Demo Beheerder",
    roles: ["admin"],
    accountType: "staff",
  },
  {
    email: "coordinator.demo@opnamebuddy.test",
    fullName: "Demo Coördinator",
    roles: ["activity_coordinator"],
    accountType: "staff",
  },
  {
    email: "caregiver1.demo@opnamebuddy.test",
    fullName: "Demo Zorgverlener Anna",
    roles: ["caregiver"],
    accountType: "staff",
  },
  {
    email: "caregiver2.demo@opnamebuddy.test",
    fullName: "Demo Zorgverlener Bram",
    roles: ["caregiver"],
    accountType: "staff",
  },
];

export const DEMO_VOLUNTEER_ACCOUNTS: DemoVolunteerAccountDefinition[] = [
  {
    email: "volunteer1.demo@opnamebuddy.test",
    fullName: "Demo Vrijwilliger Emma",
    personality: "Warm, outgoing connector; remembers names and follow-up questions",
    preferredActivityType: "social",
    bio: "Ik ben Emma. Ik hou van een praatje en een gezellige ochtendkoffie. Middags help ik graag bij sociale activiteiten.",
    weeklyBlocks: [
      { dayOfWeek: 1, morningAvailable: true, afternoonAvailable: true },
      { dayOfWeek: 2, morningAvailable: true, afternoonAvailable: false },
      { dayOfWeek: 3, morningAvailable: true, afternoonAvailable: true },
      { dayOfWeek: 5, morningAvailable: true, afternoonAvailable: true },
    ],
    absences: [
      { dayOffset: 1, block: "afternoon" },
      { dayOffset: 5, block: "morning" },
    ],
  },
  {
    email: "volunteer2.demo@opnamebuddy.test",
    fullName: "Demo Vrijwilliger Finn",
    personality: "Creative, enthusiastic; brings music and craft ideas",
    preferredActivityType: "creative",
    bio: "Ik ben Finn. Creatieve activiteiten zijn mijn favoriet: samen tekenen, puzzelen of naar rustige muziek luisteren.",
    weeklyBlocks: [
      { dayOfWeek: 2, morningAvailable: false, afternoonAvailable: true },
      { dayOfWeek: 4, morningAvailable: false, afternoonAvailable: true },
      { dayOfWeek: 6, morningAvailable: false, afternoonAvailable: true },
    ],
    absences: [
      { dayOffset: 1, block: "morning" },
      { dayOffset: 3, block: "afternoon" },
    ],
  },
  {
    email: "volunteer3.demo@opnamebuddy.test",
    fullName: "Demo Vrijwilliger Grace",
    personality: "Calm, empathetic listener; patient-paced",
    preferredActivityType: "relaxation",
    bio: "Ik ben Grace. Rustige ochtenden zijn mijn kracht: even bijpraten, een stukje lezen of samen ontspannen.",
    weeklyBlocks: [
      { dayOfWeek: 1, morningAvailable: true, afternoonAvailable: false },
      { dayOfWeek: 2, morningAvailable: true, afternoonAvailable: false },
      { dayOfWeek: 3, morningAvailable: true, afternoonAvailable: false },
      { dayOfWeek: 4, morningAvailable: true, afternoonAvailable: false },
      { dayOfWeek: 5, morningAvailable: true, afternoonAvailable: false },
    ],
    absences: [
      { dayOffset: 7, block: "morning" },
      { dayOffset: 8, block: "morning" },
    ],
  },
  {
    email: "volunteer4.demo@opnamebuddy.test",
    fullName: "Demo Vrijwilliger Hugo",
    personality: "Practical, energetic; motivates gentle movement",
    preferredActivityType: "movement",
    bio: "Ik ben Hugo. Ik help graag bij lichte beweging: een rustige wandeling of eenvoudige oefeningen op de stoel.",
    weeklyBlocks: [
      { dayOfWeek: 3, morningAvailable: false, afternoonAvailable: true },
      { dayOfWeek: 6, morningAvailable: true, afternoonAvailable: false },
    ],
    absenceTodayFirstBlock: true,
    absences: [{ dayOffset: 2, block: "afternoon" }],
  },
];

export const DEMO_PATIENT_SCENARIOS: DemoPatientScenario[] = [
  {
    ref: "DEMO-PAT-01",
    accountEmail: "patient1.demo@opnamebuddy.test",
    firstName: "Sanne",
    lastName: "de Vries",
    age: 34,
    sex: "F",
    departmentName: "Chirurgie",
    roomNumber: "C-204",
    admissionReason: "Appendectomy recovery",
    daysAdmittedAgo: 4,
    expectedDischargeOffsetDays: 5,
    context: {
      mobilityStatus: "walking_with_aid",
      transferSupport: "one_person",
      fallRisk: "low",
      requiresSupervision: "not_required",
      mobilityAidType: "walker",
      mobilityAidAvailable: "yes",
      roomRestriction: "ward_only",
      additionalAttentionPoints: ["post_surgery"],
      notes: "Herstellende na appendectomie; lichte beweging op afdeling toegestaan.",
    },
    checkIn: {
      painScore: 2,
      energyLevel: 4,
      mood: 4,
      mobilityLevel: 4,
      motivationScore: 4,
      participationNeeds: ["social", "movement"],
      symptoms: "",
      note: "Voelt zich goed; open voor een kort praatje of lichte beweging.",
    },
  },
  {
    ref: "DEMO-PAT-02",
    accountEmail: "patient2.demo@opnamebuddy.test",
    firstName: "Kees",
    lastName: "Bakker",
    age: 71,
    sex: "M",
    departmentName: "Interne geneeskunde",
    roomNumber: "I-112",
    admissionReason: "Pneumonia",
    daysAdmittedAgo: 9,
    context: {
      mobilityStatus: "chair_only",
      transferSupport: "one_person",
      fallRisk: "medium",
      requiresSupervision: "required",
      mobilityAidType: "walker",
      mobilityAidAvailable: "yes",
      roomRestriction: "ward_only",
      additionalAttentionPoints: ["fatigue", "oxygen"],
      notes: "Vermoeid door longontsteking; begeleiding nodig bij transfer.",
    },
    checkIn: {
      painScore: 3,
      energyLevel: 2,
      mood: 2,
      mobilityLevel: 2,
      motivationScore: 2,
      participationNeeds: ["social"],
      symptoms: "Vermoeidheid",
      note: "Voelt zich eenzaam; zou graag iemand aan het bed hebben.",
    },
    archetype: "Lonely; connection-first",
  },
  {
    ref: "DEMO-PAT-03",
    accountEmail: "patient3.demo@opnamebuddy.test",
    firstName: "Lotte",
    lastName: "Jansen",
    age: 58,
    sex: "F",
    departmentName: "Interne geneeskunde",
    roomNumber: "I-208",
    admissionReason: "Chemo support",
    daysAdmittedAgo: 6,
    context: {
      mobilityStatus: "wheelchair",
      transferSupport: "two_person",
      fallRisk: "medium",
      requiresSupervision: "required",
      mobilityAidType: "wheelchair",
      mobilityAidAvailable: "yes",
      roomRestriction: "room_only",
      additionalAttentionPoints: ["fatigue", "iv_pump"],
      notes: "Chemokuur; rust op kamer heeft prioriteit.",
    },
    checkIn: {
      painScore: 4,
      energyLevel: 1,
      mood: 3,
      mobilityLevel: 1,
      motivationScore: 2,
      participationNeeds: ["relaxation"],
      symptoms: "Misselijkheid, vermoeidheid",
      note: "Wil vooral rust; zachte middagactiviteit eventueel op kamer.",
    },
  },
  {
    ref: "DEMO-PAT-04",
    accountEmail: "patient4.demo@opnamebuddy.test",
    firstName: "Noah",
    lastName: "Vermeer",
    age: 29,
    sex: "M",
    departmentName: "Chirurgie",
    roomNumber: "C-118",
    admissionReason: "Hand surgery",
    daysAdmittedAgo: 2,
    context: {
      mobilityStatus: "walking_independent",
      transferSupport: "none",
      fallRisk: "low",
      requiresSupervision: "not_required",
      mobilityAidType: "unknown",
      mobilityAidAvailable: "unknown",
      roomRestriction: "no_restriction",
      additionalAttentionPoints: ["post_surgery"],
      notes: "Handoperatie; creatieve activiteiten passen goed bij herstel.",
    },
    checkIn: {
      painScore: 2,
      energyLevel: 3,
      mood: 4,
      mobilityLevel: 4,
      motivationScore: 4,
      participationNeeds: ["creative"],
      symptoms: "",
      note: "Kijkt uit naar de creatieve middagactiviteit.",
    },
  },
  {
    ref: "DEMO-PAT-05",
    accountEmail: "patient5.demo@opnamebuddy.test",
    firstName: "Eva",
    lastName: "Mulder",
    age: 45,
    sex: "F",
    departmentName: "Neurologie",
    roomNumber: "N-305",
    admissionReason: "Burnout",
    daysAdmittedAgo: 11,
    context: {
      mobilityStatus: "walking_independent",
      transferSupport: "none",
      fallRisk: "low",
      requiresSupervision: "not_required",
      mobilityAidType: "unknown",
      mobilityAidAvailable: "unknown",
      roomRestriction: "no_restriction",
      additionalAttentionPoints: ["cognitive_support", "fatigue"],
      notes: "Burn-out opname; geen druk, kleine stappen.",
    },
    checkIn: {
      painScore: 1,
      energyLevel: 2,
      mood: 2,
      mobilityLevel: 3,
      motivationScore: 2,
      participationNeeds: ["social", "relaxation"],
      symptoms: "Vermoeidheid",
      note: "Zou een zachte aanmoediging waarderen, maar geen verplichting.",
    },
  },
  {
    ref: "DEMO-PAT-06",
    accountEmail: "patient6.demo@opnamebuddy.test",
    firstName: "Tom",
    lastName: "Hendriks",
    age: 52,
    sex: "M",
    departmentName: "Neurologie",
    roomNumber: "N-210",
    admissionReason: "Anxiety",
    daysAdmittedAgo: 7,
    context: {
      mobilityStatus: "walking_independent",
      transferSupport: "none",
      fallRisk: "medium",
      requiresSupervision: "not_required",
      mobilityAidType: "unknown",
      mobilityAidAvailable: "unknown",
      roomRestriction: "ward_only",
      additionalAttentionPoints: ["cognitive_support"],
      notes: "Angststoornis; rustige benadering en voorspelbaarheid helpen.",
    },
    checkIn: {
      painScore: 2,
      energyLevel: 2,
      mood: 2,
      mobilityLevel: 3,
      motivationScore: 2,
      participationNeeds: ["relaxation", "social"],
      symptoms: "Spanning, onrust",
      note: "Open voor rustig ochtendcontact als het voorspelbaar is.",
    },
  },
  {
    ref: "DEMO-PAT-07",
    accountEmail: "patient7.demo@opnamebuddy.test",
    firstName: "Mia",
    lastName: "van Dijk",
    age: 67,
    sex: "F",
    departmentName: "Orthopedie",
    roomNumber: "O-402",
    admissionReason: "Hip replacement",
    daysAdmittedAgo: 5,
    context: {
      mobilityStatus: "wheelchair",
      transferSupport: "two_person",
      fallRisk: "high",
      requiresSupervision: "required",
      mobilityAidType: "walker",
      mobilityAidAvailable: "yes",
      roomRestriction: "ward_only",
      additionalAttentionPoints: ["post_surgery", "wound_or_drain"],
      notes: "Heupprothese; beweging alleen volgens fysio-protocol.",
    },
    checkIn: {
      painScore: 6,
      energyLevel: 2,
      mood: 3,
      mobilityLevel: 1,
      motivationScore: 3,
      participationNeeds: ["movement"],
      symptoms: "Pijn bij bewegen",
      note: "Wil graag bewegen maar pijn en mobiliteit beperken dit sterk.",
    },
    archetype: "Conflicting needs vs symptoms",
  },
  {
    ref: "DEMO-PAT-08",
    accountEmail: "patient8.demo@opnamebuddy.test",
    firstName: "Ruben",
    lastName: "Smit",
    age: 41,
    sex: "M",
    departmentName: "Interne geneeskunde",
    roomNumber: "I-301",
    admissionReason: "Pre-discharge review",
    daysAdmittedAgo: 3,
    expectedDischargeOffsetDays: 1,
    context: {
      mobilityStatus: "walking_independent",
      transferSupport: "none",
      fallRisk: "low",
      requiresSupervision: "not_required",
      mobilityAidType: "unknown",
      mobilityAidAvailable: "unknown",
      roomRestriction: "no_restriction",
      additionalAttentionPoints: [],
      notes: "Afrondende opnamecontrole; ontslag verwacht morgen.",
    },
    checkIn: {
      painScore: 1,
      energyLevel: 4,
      mood: 4,
      mobilityLevel: 5,
      motivationScore: 5,
      participationNeeds: ["social"],
      symptoms: "",
      note: "Voelt zich goed en kijkt uit naar ontslag; graag nog even gezellig afsluiten.",
    },
    archetype: "Close to discharge",
  },
  {
    ref: "DEMO-PAT-09",
    accountEmail: "patient9.demo@opnamebuddy.test",
    firstName: "Iris",
    lastName: "de Boer",
    age: 63,
    sex: "F",
    departmentName: "Cardiologie",
    roomNumber: "CA-105",
    admissionReason: "Observation / monitoring",
    daysAdmittedAgo: 2,
    context: {
      mobilityStatus: "walking_with_aid",
      transferSupport: "one_person",
      fallRisk: "low",
      requiresSupervision: "not_required",
      mobilityAidType: "cane",
      mobilityAidAvailable: "yes",
      roomRestriction: "ward_only",
      additionalAttentionPoints: [],
      notes: "Cardiale observatie; stabiel maar nog onder monitoring.",
    },
    checkIn: {
      painScore: 2,
      energyLevel: 3,
      mood: 3,
      mobilityLevel: 3,
      motivationScore: 3,
      participationNeeds: [],
      symptoms: "",
      note: "Geen specifieke wens vandaag.",
    },
    archetype: "No participation preference",
  },
  {
    ref: "DEMO-PAT-10",
    accountEmail: "patient10.demo@opnamebuddy.test",
    firstName: "Fatima",
    lastName: "El Amrani",
    age: 38,
    sex: "F",
    departmentName: "Interne geneeskunde",
    roomNumber: "I-215",
    admissionReason: "Social isolation support",
    daysAdmittedAgo: 8,
    context: {
      mobilityStatus: "walking_independent",
      transferSupport: "none",
      fallRisk: "low",
      requiresSupervision: "not_required",
      mobilityAidType: "unknown",
      mobilityAidAvailable: "unknown",
      roomRestriction: "no_restriction",
      additionalAttentionPoints: [],
      notes: "Sociale isolatie; enthousiast over groepscontact.",
    },
    checkIn: {
      painScore: 1,
      energyLevel: 4,
      mood: 5,
      mobilityLevel: 4,
      motivationScore: 5,
      participationNeeds: ["social", "movement", "creative"],
      symptoms: "",
      note: "Wil graag gezelligheid en energie in de groep; het liefst zowel ochtend als middag.",
    },
    archetype: "Highly social",
  },
  {
    ref: "DEMO-PAT-11",
    accountEmail: "patient11.demo@opnamebuddy.test",
    firstName: "Jan",
    lastName: "Kuipers",
    age: 55,
    sex: "M",
    departmentName: "Orthopedie",
    roomNumber: "O-118",
    admissionReason: "Shoulder surgery",
    daysAdmittedAgo: 6,
    context: {
      mobilityStatus: "walking_with_aid",
      transferSupport: "one_person",
      fallRisk: "medium",
      requiresSupervision: "not_required",
      mobilityAidType: "walker",
      mobilityAidAvailable: "yes",
      roomRestriction: "ward_only",
      additionalAttentionPoints: ["post_surgery"],
      notes: "Schouderoperatie; beweging en creatief werk in overleg.",
    },
    checkIn: {
      painScore: 3,
      energyLevel: 3,
      mood: 3,
      mobilityLevel: 3,
      motivationScore: 3,
      participationNeeds: ["movement", "creative"],
      symptoms: "",
      note: "Redelijk herstel; open voor gevarieerde activiteiten.",
    },
  },
  {
    ref: "DEMO-PAT-12",
    accountEmail: "patient12.demo@opnamebuddy.test",
    firstName: "Lien",
    lastName: "Vos",
    age: 48,
    sex: "F",
    departmentName: "Neurologie",
    roomNumber: "N-118",
    admissionReason: "Depression / adjustment",
    daysAdmittedAgo: 10,
    context: {
      mobilityStatus: "walking_independent",
      transferSupport: "none",
      fallRisk: "low",
      requiresSupervision: "not_required",
      mobilityAidType: "unknown",
      mobilityAidAvailable: "unknown",
      roomRestriction: "no_restriction",
      additionalAttentionPoints: ["cognitive_support"],
      notes: "Aanpassingsstoornis; liever rustig individueel contact.",
    },
    checkIn: {
      painScore: 2,
      energyLevel: 2,
      mood: 2,
      mobilityLevel: 4,
      motivationScore: 2,
      participationNeeds: ["social"],
      symptoms: "",
      note: "Liever rustig ochtendgesprek in klein gezelschap, geen grote groep.",
    },
    archetype: "Prefers individual contact",
  },
];

export const DEMO_DAILY_PLANS: DemoDailyPlanDefinition[] = [
  {
    dayOffset: 0,
    recordedByEmail: "volunteer2.demo@opnamebuddy.test",
    afternoonCategory: "creative",
    afternoonTitle: "Samen kleuren en muziek luisteren",
    participantMessage:
      "Je bent welkom om mee te doen in de activiteitenruimte. Het is rustig en je kunt op elk moment stoppen.",
  },
  {
    dayOffset: 1,
    recordedByEmail: "coordinator.demo@opnamebuddy.test",
    afternoonCategory: "movement",
    afternoonTitle: "Rustige ochtendwandeling in de binnentuin",
    participantMessage:
      "Morgen is er een lichte groepswandeling. Doe alleen mee als je je goed genoeg voelt en het past bij je zorgafspraken.",
  },
];

export const ALL_DEMO_EMAILS: string[] = [
  ...DEMO_STAFF_ACCOUNTS.map((account) => account.email),
  ...DEMO_VOLUNTEER_ACCOUNTS.map((account) => account.email),
  ...DEMO_PATIENT_SCENARIOS.map((patient) => patient.accountEmail),
];

export function isDemoEmail(email: string | undefined | null): boolean {
  return Boolean(email?.toLowerCase().endsWith(DEMO_EMAIL_DOMAIN));
}

export function isDemoPatientRef(externalRef: string | null | undefined): boolean {
  return Boolean(externalRef?.startsWith(DEMO_PATIENT_REF_PREFIX));
}
