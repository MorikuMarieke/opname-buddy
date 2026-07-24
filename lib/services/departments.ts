import { createClient } from "@/lib/supabase/client";
import type { Department } from "@/types/department";
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

/** Admission forms — browser client with user session. */
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
