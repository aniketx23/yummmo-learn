import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, short_description, thumbnail_url, price, original_price, is_free, is_published, total_lessons, total_duration_minutes, language, level, tags, category_id, instructor_id, created_at"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [{ data: category }, { data: instructor }, { data: sections }, { data: lessons }, countRes] =
    await Promise.all([
      course.category_id
        ? supabase
            .from("categories")
            .select("name, slug")
            .eq("id", course.category_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      course.instructor_id
        ? supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", course.instructor_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("sections")
        .select("id, title, display_order")
        .eq("course_id", course.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("lessons")
        .select(
          "id, title, section_id, display_order, is_free_preview, video_duration_seconds"
        )
        .eq("course_id", course.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("course_id", course.id),
    ]);

  return NextResponse.json({
    course: { ...course, category, instructor },
    sections: sections ?? [],
    lessons: lessons ?? [],
    enrollmentCount: countRes.count ?? 0,
  });
}
