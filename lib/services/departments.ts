import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Department,
  DepartmentInput,
  DepartmentUpdateInput,
} from "@/types/department";
import type { Tables } from "@/types/database";

type DepartmentRow = Tables<"departments">;

function mapDepartment(row: DepartmentRow): Department {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getSupabaseErrorMessage(error: { message: string }): string {
  if (error.message.includes("permission denied")) {
    return "Je hebt geen toegang tot deze actie.";
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

/** Caregiver UI — browser client with user session. */
export async function listActiveDepartments(): Promise<Department[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map(mapDepartment);
}

/** Admin server actions — service role (see admin-accounts.ts). */
export async function listAllDepartments(): Promise<Department[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return (data ?? []).map(mapDepartment);
}

async function assertUniqueActiveName(
  name: string,
  excludeId?: string,
): Promise<void> {
  const supabase = createAdminClient();
  const trimmed = name.trim();

  let query = supabase
    .from("departments")
    .select("id")
    .eq("is_active", true)
    .ilike("name", trimmed);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  if (data && data.length > 0) {
    throw new Error("Er bestaat al een actieve afdeling met deze naam.");
  }
}

export async function createDepartment(input: DepartmentInput): Promise<Department> {
  const supabase = createAdminClient();

  await assertUniqueActiveName(input.name);

  const { data, error } = await supabase
    .from("departments")
    .insert({
      name: input.name.trim(),
      code: input.code?.trim() || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapDepartment(data);
}

export async function updateDepartment(
  departmentId: string,
  input: DepartmentUpdateInput,
): Promise<Department> {
  const supabase = createAdminClient();

  if (input.name !== undefined) {
    await assertUniqueActiveName(input.name, departmentId);
  }

  const payload: Partial<DepartmentRow> = {};

  if (input.name !== undefined) {
    payload.name = input.name.trim();
  }

  if (input.code !== undefined) {
    payload.code = input.code?.trim() || null;
  }

  const { data, error } = await supabase
    .from("departments")
    .update(payload)
    .eq("id", departmentId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapDepartment(data);
}

export async function setDepartmentActive(
  departmentId: string,
  isActive: boolean,
): Promise<Department> {
  const supabase = createAdminClient();

  if (isActive) {
    const { data: existing, error: fetchError } = await supabase
      .from("departments")
      .select("name")
      .eq("id", departmentId)
      .single();

    if (fetchError || !existing) {
      throw new Error(getSupabaseErrorMessage(fetchError ?? { message: "unknown" }));
    }

    await assertUniqueActiveName(existing.name, departmentId);
  }

  const { data, error } = await supabase
    .from("departments")
    .update({ is_active: isActive })
    .eq("id", departmentId)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapDepartment(data);
}
