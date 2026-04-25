import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseWizard } from "@/components/admin/course-wizard";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: course }, { data: categories }, { data: sections }] =
    await Promise.all([
      supabase.from("courses").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("categories")
        .select("id, name, slug")
        .order("display_order"),
      supabase
        .from("sections")
        .select("id, title, display_order")
        .eq("course_id", id)
        .order("display_order"),
    ]);

  if (!course) notFound();

  const sectionIds = (sections ?? []).map((s: { id: string }) => s.id);
  const { data: lessons } = sectionIds.length
    ? await supabase
        .from("lessons")
        .select(
          "id, section_id, title, description, is_free_preview, video_bunny_id, video_url, video_duration_seconds, display_order, tips, attachments"
        )
        .in("section_id", sectionIds)
        .order("display_order")
    : { data: [] };

  type LessonRow = {
    id: string;
    section_id: string;
    title: string;
    description: string | null;
    is_free_preview: boolean;
    video_bunny_id: string | null;
    video_url: string | null;
    video_duration_seconds: number;
    display_order: number;
    tips: string | null;
    attachments: { type: string; name: string; url: string }[] | null;
  };

  const lessonsBySection = new Map<string, LessonRow[]>();
  for (const l of (lessons ?? []) as LessonRow[]) {
    const arr = lessonsBySection.get(l.section_id) ?? [];
    arr.push(l);
    lessonsBySection.set(l.section_id, arr);
  }

  const existingSections = (sections ?? []).map(
    (s: { id: string; title: string }) => ({
      title: s.title,
      lessons: (lessonsBySection.get(s.id) ?? []).map((l) => ({
        title: l.title,
        description: l.description ?? "",
        is_free_preview: l.is_free_preview,
        video_bunny_id: l.video_bunny_id ?? "",
        video_url: l.video_url ?? "",
        tips: l.tips ?? "",
        attachments: (l.attachments ?? []) as { type: "file" | "link"; name: string; url: string }[],
      })),
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Edit course</h1>
      <CourseWizard
        categories={categories ?? []}
        existingCourse={{
          id: course.id,
          title: course.title,
          slug: course.slug,
          short_description: course.short_description ?? "",
          description: course.description ?? "",
          category_id: course.category_id ?? "",
          level: course.level ?? "Beginner",
          language: course.language ?? "Hindi",
          tags: (course.tags as string[] | null)?.join(", ") ?? "",
          is_free: course.is_free ?? false,
          price: String(course.price ?? "499"),
          original_price:
            course.original_price != null
              ? String(course.original_price)
              : "",
          thumbnail_url: course.thumbnail_url ?? "",
          is_published: course.is_published ?? false,
          sections: existingSections,
          resources: (course.resources ?? []) as { type: "file" | "link"; name: string; url: string }[],
        }}
      />
    </div>
  );
}
