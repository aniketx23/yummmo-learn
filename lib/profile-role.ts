import type { SupabaseClient } from "@supabase/supabase-js";

/** Normalize DB role for comparisons (handles whitespace). */
export function normalizeAppRole(value: string | null | undefined): string {
  return (value ?? "student").trim();
}

export function isStaffRole(role: string): boolean {
  return role === "super_admin" || role === "instructor";
}

/**
 * Current user's app role from `profiles`.
 * Always filter by `userId`: staff RLS can see every profile row, so unfiltered
 * `.select().single()` returns multiple rows and breaks `.single()`.
 */
export async function fetchProfileAppRole(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "auth_app_role"
  );

  if (!rpcError && typeof rpcData === "string") {
    return normalizeAppRole(rpcData);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return normalizeAppRole(profile?.role ?? undefined);
}
