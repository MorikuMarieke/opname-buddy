import type { CompletenessLevel } from "@/types/patient-context";

export const PATIENT_CONTEXT_COPY = {
  staff: {
    title: "Zorgcontext",
    description: "Kernfeiten voor veilig activiteitenadvies.",
    subNavLabel: "Zorgcontext",
  },
  patient: {
    title: "Jouw zorgcontext",
    description:
      "Deze informatie is door uw zorgverlener ingevuld en helpt OpnameBuddy om veilige en passende activiteiten aan te bevelen. Neem contact op met uw zorgverlener als u denkt dat iets niet klopt.",
    navLabel: "Jouw zorgcontext",
  },
  completeness: {
    complete: "Compleet",
    insufficient: "Onvoldoende context",
  } satisfies Record<CompletenessLevel, string>,
  missingInfoHeading: "Nog in te vullen:",
  fieldIncompleteHint: "Nog in te vullen",
  optionalHint: "Optioneel — blokkeert niet op compleetheid.",
  unknownLabel: "Onbekend",
  unknownSelectHint: "Onbekend (nog niet vastgesteld)",
  audit: {
    lastUpdated: "Laatst bijgewerkt",
    updatedBy: "Bijgewerkt door",
    caregiverFallback: "Zorgverlener",
    patientUpdatedBy: "uw zorgverlener",
    notYetSaved: "—",
  },
  sections: {
    core: "Kern",
    optional: "Optioneel",
  },
  attentionOtherLabel: "Overige toelichting",
  notesLabel: "Notities (optioneel)",
} as const;
