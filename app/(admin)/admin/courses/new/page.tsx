import { createClient } from "@/lib/supabase/server";
import { CourseWizard } from "@/components/admin/course-wizard";

export default async function NewCoursePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">New course</h1>
      <CourseWizard categories={categories ?? []} />
    </div>
  );
}
