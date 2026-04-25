import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postN8nWebhook } from "@/lib/n8n";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { courseId?: string };
  if (!body.courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, is_free, is_published")
    .eq("id", body.courseId)
    .single();

  if (!course || !course.is_published) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (!course.is_free) {
    return NextResponse.json({ error: "Course is not free" }, { status: 400 });
  }

  const { error } = await supabase.from("enrollments").upsert(
    {
      student_id: user.id,
      course_id: course.id,
      is_free: true,
      payment_id: null,
    },
    { onConflict: "student_id,course_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await postN8nWebhook(process.env.N8N_ENROLLMENT_WEBHOOK_URL, {
    type: "free_enrollment",
    userId: user.id,
    courseId: course.id,
    courseTitle: course.title,
  });

  return NextResponse.json({ ok: true });
}
