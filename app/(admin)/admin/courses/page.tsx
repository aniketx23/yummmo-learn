import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { AdminCoursesTable } from "@/components/admin/admin-courses-table";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: coursesRaw } = await supabase
    .from("courses")
    .select("id, title, slug, is_published, is_free, price, category_id, created_at")
    .order("created_at", { ascending: false });

  type CourseRow = {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    is_free: boolean;
    price: string;
    category_id: string | null;
    created_at: string;
  };
  const courses = (coursesRaw ?? []) as CourseRow[];

  const catIds = Array.from(
    new Set(
      courses.map((c) => c.category_id).filter((id): id is string => Boolean(id))
    )
  );
  const { data: cats } = catIds.length
    ? await supabase.from("categories").select("id, name").in("id", catIds)
    : { data: [] as { id: string; name: string }[] };
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));

  const tableData = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    is_published: c.is_published,
    is_free: c.is_free,
    price: c.price,
    categoryName: c.category_id ? catName.get(c.category_id) ?? "—" : "—",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Courses</h1>
        <Button asChild>
          <Link href="/admin/courses/new">New course</Link>
        </Button>
      </div>
      <AdminCoursesTable courses={tableData} />
    </div>
  );
}
