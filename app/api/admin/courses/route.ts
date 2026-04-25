import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type LessonInput = {
  title: string;
  description?: string | null;
  is_free_preview?: boolean;
  video_bunny_id?: string | null;
  video_url?: string | null;
  video_duration_seconds?: number;
};

type SectionInput = {
  title: string;
  lessons: LessonInput[];
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "super_admin" && profile?.role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    title: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    category_id?: string | null;
    level?: "Beginner" | "Intermediate" | "Advanced";
    language?: string;
    is_free?: boolean;
    price?: number;
    original_price?: number | null;
    thumbnail_url?: string | null;
    tags?: string[] | null;
    is_published?: boolean;
    sections?: SectionInput[];
    resources?: unknown[];
  };

  if (!body.title?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: "title and slug required" }, { status: 400 });
  }

  const sections = body.sections ?? [];
  let totalLessons = 0;
  let totalMinutes = 0;
  for (const s of sections) {
    totalLessons += s.lessons?.length ?? 0;
    for (const l of s.lessons ?? []) {
      totalMinutes += Math.ceil((l.video_duration_seconds ?? 0) / 60);
    }
  }

  const { data: course, error: cErr } = await supabase
    .from("courses")
    .insert({
      instructor_id: user.id,
      title: body.title.trim(),
      slug: body.slug.trim(),
      short_description: body.short_description ?? null,
      description: body.description ?? null,
      category_id: body.category_id ?? null,
      level: body.level ?? "Beginner",
      language: body.language ?? "Hindi",
      is_free: body.is_free ?? false,
      price: (body.price ?? 0).toFixed(2),
      original_price:
        body.original_price != null ? body.original_price.toFixed(2) : null,
      thumbnail_url: body.thumbnail_url ?? null,
      tags: body.tags ?? null,
      is_published: body.is_published ?? false,
      total_lessons: totalLessons,
      total_duration_minutes: totalMinutes,
      resources: body.resources ?? [],
    })
    .select("id")
    .single();

  if (cErr || !course) {
    return NextResponse.json({ error: cErr?.message ?? "Create failed" }, { status: 400 });
  }

  let orderS = 0;
  for (const sec of sections) {
    const { data: section, error: sErr } = await supabase
      .from("sections")
      .insert({
        course_id: course.id,
        title: sec.title,
        display_order: orderS++,
      })
      .select("id")
      .single();
    if (sErr || !section) {
      return NextResponse.json({ error: sErr?.message ?? "Section failed" }, { status: 400 });
    }
    let orderL = 0;
    for (const les of sec.lessons ?? []) {
      const { error: lErr } = await supabase.from("lessons").insert({
        course_id: course.id,
        section_id: section.id,
        title: les.title,
        description: les.description ?? null,
        is_free_preview: les.is_free_preview ?? false,
        video_bunny_id: les.video_bunny_id ?? null,
        video_url: les.video_url ?? null,
        video_duration_seconds: les.video_duration_seconds ?? 0,
        tips: (les as Record<string, unknown>).tips ?? null,
        attachments: (les as Record<string, unknown>).attachments ?? [],
        display_order: orderL++,
      });
      if (lErr) {
        return NextResponse.json({ error: lErr.message }, { status: 400 });
      }
    }
  }

  return NextResponse.json({ id: course.id });
}
