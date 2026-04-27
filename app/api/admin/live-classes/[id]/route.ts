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

// PUT — update a live class
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  const keys = [
    "title",
    "description",
    "schedule_type",
    "schedule_days",
    "time_slot",
    "class_date",
    "start_time",
    "end_time",
    "location",
    "location_city",
    "thumbnail_url",
    "max_spots",
    "is_active",
  ] as const;
  for (const k of keys) {
    if (k in body) patch[k] = body[k];
  }
  if ("price" in body && typeof body.price === "number") {
    patch.price = body.price.toFixed(2);
  }

  const { error } = await supabase
    .from("live_classes")
    .update(patch)
    .eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE — delete a live class
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("live_classes").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
