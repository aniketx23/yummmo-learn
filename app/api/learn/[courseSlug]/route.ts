import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", course.id)
    .eq("student_id", user.id)
    .maybeSingle();

  const { data: sections } = await supabase
    .from("sections")
    .select("id, title, display_order")
    .eq("course_id", course.id)
    .order("display_order", { ascending: true });

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("display_order", { ascending: true });

  return NextResponse.json({
    course,
    enrolled: !!enrollment,
    sections: sections ?? [],
    lessons: lessons ?? [],
  });
}
