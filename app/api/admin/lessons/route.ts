import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "super_admin" && profile?.role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    course_id: string;
    section_id: string;
    title: string;
    description?: string | null;
    is_free_preview?: boolean;
    video_bunny_id?: string | null;
    video_url?: string | null;
    video_duration_seconds?: number;
    display_order?: number;
  };

  if (!body.course_id || !body.section_id || !body.title?.trim()) {
    return NextResponse.json(
      { error: "course_id, section_id, and title required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      course_id: body.course_id,
      section_id: body.section_id,
      title: body.title.trim(),
      description: body.description ?? null,
      is_free_preview: body.is_free_preview ?? false,
      video_bunny_id: body.video_bunny_id ?? null,
      video_url: body.video_url ?? null,
      video_duration_seconds: body.video_duration_seconds ?? 0,
      display_order: body.display_order ?? 0,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
