import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id, enrolled_at")
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  const courseIds = [...new Set((enrollments ?? []).map((e) => e.course_id))];
  const { data: courses } = courseIds.length
    ? await supabase
        .from("courses")
        .select("id, slug, title, thumbnail_url, total_lessons")
        .in("id", courseIds)
    : { data: [] as { id: string; slug: string; title: string; thumbnail_url: string | null; total_lessons: number }[] };

  const courseBy = new Map((courses ?? []).map((c) => [c.id, c]));

  return NextResponse.json({
    profile,
    enrollments: (enrollments ?? []).map((e) => ({
      ...e,
      course: courseBy.get(e.course_id) ?? null,
    })),
  });
}
