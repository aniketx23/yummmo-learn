import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LearnCourseIndexPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", course.id)
    .eq("student_id", user.id)
    .maybeSingle();

  const { data: firstLesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", course.id)
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!firstLesson) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">
          This course has no lessons yet. Check back soon.
        </p>
      </div>
    );
  }

  const { data: previewLesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", course.id)
    .eq("is_free_preview", true)
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!enrollment && previewLesson) {
    redirect(`/learn/${courseSlug}/${previewLesson.id}`);
  }
  if (!enrollment) {
    redirect(`/courses/${courseSlug}`);
  }

  redirect(`/learn/${courseSlug}/${firstLesson.id}`);
}
