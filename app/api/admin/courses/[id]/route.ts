import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireStaff(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "super_admin" && profile?.role !== "instructor")
    return null;
  return user;
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

  // Use admin client to bypass RLS and delete dependent rows
  // that lack ON DELETE CASCADE (enrollments, payments, wishlists)
  const admin = createAdminClient();

  // Delete in FK-safe order: progress → enrollments → payments → wishlists → course
  await admin.from("progress").delete().eq("course_id", id);
  await admin.from("enrollments").delete().eq("course_id", id);
  await admin.from("payments").delete().eq("course_id", id);
  await admin.from("wishlists").delete().eq("course_id", id);

  const { error } = await admin.from("courses").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

type LessonInput = {
  title: string;
  description?: string | null;
  is_free_preview?: boolean;
  video_bunny_id?: string | null;
  video_url?: string | null;
  video_duration_seconds?: number;
  tips?: string | null;
  attachments?: unknown[] | null;
};

type SectionInput = {
  title: string;
  lessons: LessonInput[];
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown> & {
    sections?: SectionInput[];
  };

  // ── Update course metadata ────────────────────────────────────────
  const patch: Record<string, unknown> = {};
  const keys = [
    "title",
    "slug",
    "short_description",
    "description",
    "category_id",
    "level",
    "language",
    "is_free",
    "thumbnail_url",
    "tags",
    "is_published",
    "resources",
  ] as const;
  for (const k of keys) {
    if (k in body) patch[k] = body[k];
  }
  if ("price" in body && typeof body.price === "number") {
    patch.price = body.price.toFixed(2);
  }
  if ("original_price" in body) {
    patch.original_price =
      body.original_price == null
        ? null
        : Number(body.original_price).toFixed(2);
  }

  // ── If sections provided, rebuild curriculum ──────────────────────
  const sections = body.sections;
  if (sections) {
    let totalLessons = 0;
    let totalMinutes = 0;
    for (const s of sections) {
      totalLessons += s.lessons?.length ?? 0;
      for (const l of s.lessons ?? []) {
        totalMinutes += Math.ceil((l.video_duration_seconds ?? 0) / 60);
      }
    }
    patch.total_lessons = totalLessons;
    patch.total_duration_minutes = totalMinutes;
  }

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase
      .from("courses")
      .update(patch)
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // ── Replace sections + lessons (delete-and-reinsert) ──────────────
  if (sections) {
    // Delete old sections (cascade deletes lessons)
    const { error: delErr } = await supabase
      .from("sections")
      .delete()
      .eq("course_id", id);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    // Insert new sections + lessons
    let orderS = 0;
    for (const sec of sections) {
      const { data: section, error: sErr } = await supabase
        .from("sections")
        .insert({
          course_id: id,
          title: sec.title,
          display_order: orderS++,
        })
        .select("id")
        .single();
      if (sErr || !section) {
        return NextResponse.json(
          { error: sErr?.message ?? "Section create failed" },
          { status: 400 }
        );
      }
      let orderL = 0;
      for (const les of sec.lessons ?? []) {
        const { error: lErr } = await supabase.from("lessons").insert({
          course_id: id,
          section_id: section.id,
          title: les.title,
          description: les.description ?? null,
          is_free_preview: les.is_free_preview ?? false,
          video_bunny_id: les.video_bunny_id ?? null,
          video_url: les.video_url ?? null,
          video_duration_seconds: les.video_duration_seconds ?? 0,
          tips: les.tips ?? null,
          attachments: les.attachments ?? [],
          display_order: orderL++,
        });
        if (lErr) {
          return NextResponse.json({ error: lErr.message }, { status: 400 });
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}
