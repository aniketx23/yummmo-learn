import { createClient } from "@/lib/supabase/server";
import { CourseForm } from "@/components/admin/course-form";

export default async function NewCoursePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">New cake tutorial</h1>
      <CourseForm categories={categories ?? []} />
    </div>
  );
}
