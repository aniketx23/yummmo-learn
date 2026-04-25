import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireStaff(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "super_admin" || profile?.role === "instructor";
}

// PUT — update registration status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { status: string; notes?: string };

  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  if (body.notes !== undefined) patch.notes = body.notes;

  const { error } = await supabase
    .from("live_class_registrations")
    .update(patch)
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
