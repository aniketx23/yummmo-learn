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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    title?: string;
    description?: string | null;
    is_free_preview?: boolean;
    video_bunny_id?: string | null;
    video_url?: string | null;
    video_duration_seconds?: number;
    display_order?: number;
  };

  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = body.title.trim();
  if (body.description !== undefined) patch.description = body.description;
  if (body.is_free_preview !== undefined) patch.is_free_preview = body.is_free_preview;
  if (body.video_bunny_id !== undefined) patch.video_bunny_id = body.video_bunny_id;
  if (body.video_url !== undefined) patch.video_url = body.video_url;
  if (body.video_duration_seconds !== undefined)
    patch.video_duration_seconds = body.video_duration_seconds;
  if (body.display_order !== undefined) patch.display_order = body.display_order;

  const { error } = await supabase.from("lessons").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
