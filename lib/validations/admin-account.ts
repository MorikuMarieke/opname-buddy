import { z } from "zod";

import { STAFF_ROLE_NAMES } from "@/lib/constants/admin-account-copy";

const staffRoleSchema = z.enum(STAFF_ROLE_NAMES);

export const createStaffAccountSchema = z.object({
  fullName: z.string().trim().min(1, "Naam is verplicht.").max(200),
  email: z.string().trim().email("Ongeldig e-mailadres."),
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens zijn.")
    .max(128),
  roles: z
    .array(staffRoleSchema)
    .min(1, "Selecteer minimaal één rol.")
    .max(3),
});

export type CreateStaffAccountInput = z.infer<typeof createStaffAccountSchema>;

export const updateAccountProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Naam is verplicht.").max(200),
  preferredLanguage: z.enum(["nl", "en"]),
});

export type UpdateAccountProfileInput = z.infer<
  typeof updateAccountProfileSchema
>;

export const setStaffRolesSchema = z.object({
  roles: z
    .array(staffRoleSchema)
    .min(1, "Selecteer minimaal één rol.")
    .max(3),
});

export type SetStaffRolesInput = z.infer<typeof setStaffRolesSchema>;
