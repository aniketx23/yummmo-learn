import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CourseForm, type ExistingCourse } from "@/components/admin/course-form";

type Attachment = { type: "file" | "link"; name: string; url: string };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: course }, { data: categories }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("display_order"),
  ]);

  if (!course) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("video_url, tips, attachments")
    .eq("course_id", id)
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const attachments = Array.isArray(lesson?.attachments)
    ? (lesson.attachments as Attachment[])
    : [];
  const recipe = attachments.find((a) => a.type === "file") ?? null;

  const existingCourse: ExistingCourse = {
    id: course.id,
    title: course.title ?? "",
    slug: course.slug ?? "",
    short_description: course.short_description ?? "",
    description: course.description ?? "",
    category_id: course.category_id ?? "",
    level: course.level ?? "Beginner",
    language: course.language ?? "Hindi",
    thumbnail_url: course.thumbnail_url ?? "",
    is_published: course.is_published ?? false,
    video_url: lesson?.video_url ?? "",
    tips: lesson?.tips ?? "",
    recipe,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Edit cake tutorial</h1>
        <Button variant="outline" asChild>
          <Link href={`/admin/courses/${course.id}/access`}>Manage access</Link>
        </Button>
      </div>
      <CourseForm categories={categories ?? []} existingCourse={existingCourse} />
    </div>
  );
}
