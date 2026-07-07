import { z } from "zod";

const patientSexSchema = z.enum(["M", "F", "X"]);

export const patientDemographicsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Voornaam is verplicht.")
    .max(100, "Voornaam is te lang."),
  lastName: z
    .string()
    .trim()
    .min(1, "Achternaam is verplicht.")
    .max(100, "Achternaam is te lang."),
  birthDate: z
    .union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geboortedatum is ongeldig."),
      z.literal("").transform(() => null),
      z.null(),
    ]),
  sex: patientSexSchema,
});

export const admissionFormSchema = z
  .object({
    admittedOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Opnamedatum is ongeldig."),
    departmentId: z.string().uuid("Afdeling is verplicht."),
    roomNumber: z
      .union([
        z.string().trim().max(50, "Kamernummer is te lang."),
        z.literal("").transform(() => null),
        z.null(),
      ])
      .optional(),
    expectedDischargeOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Verwachte ontslagdatum is ongeldig.")
      .nullable()
      .or(z.literal("").transform(() => null)),
  })
  .refine(
    (data) =>
      !data.expectedDischargeOn ||
      data.expectedDischargeOn >= data.admittedOn,
    {
      message: "Verwachte ontslagdatum moet op of na de opnamedatum liggen.",
      path: ["expectedDischargeOn"],
    },
  );

export const admitPatientSchema = patientDemographicsSchema
  .merge(admissionFormSchema)
  .refine((data) => Boolean(data.birthDate), {
    message: "Geboortedatum is verplicht.",
    path: ["birthDate"],
  });

export const newAdmissionSchema = admissionFormSchema;

export const patientSearchSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

export const redeemLinkCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Voer een 6-cijferige code in."),
});

export type PatientDemographicsFormValues = z.infer<typeof patientDemographicsSchema>;
export type AdmissionFormValues = z.infer<typeof admissionFormSchema>;
export type AdmitPatientFormValues = z.infer<typeof admitPatientSchema>;
export type NewAdmissionFormValues = z.infer<typeof newAdmissionSchema>;
export type PatientSearchInput = z.infer<typeof patientSearchSchema>;
export type RedeemLinkCodeInput = z.infer<typeof redeemLinkCodeSchema>;
