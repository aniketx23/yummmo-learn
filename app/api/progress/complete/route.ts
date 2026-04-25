import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    lessonId: string;
    courseId: string;
  };

  const { error } = await supabase.from("progress").upsert(
    {
      student_id: user.id,
      lesson_id: body.lessonId,
      course_id: body.courseId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
