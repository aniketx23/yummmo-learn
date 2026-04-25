import type { Metadata } from "next";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "All Courses",
  description:
    "Browse healthy cooking courses — baking, Indian cooking, ingredient swaps. Learn in Hindi + Hinglish.",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const level = typeof sp.level === "string" ? sp.level : "";
  const isFree = typeof sp.free === "string" ? sp.free : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";

  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select(
      "id, slug, title, short_description, thumbnail_url, price, original_price, is_free, total_lessons, total_duration_minutes, instructor_id, category_id, level, language, created_at"
    )
    .eq("is_published", true);

  if (q.trim()) {
    query = query.textSearch("search_vector", q.trim(), {
      type: "websearch",
      config: "english",
    });
  }
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    if (cat?.id) query = query.eq("category_id", cat.id);
  }
  if (level && ["Beginner", "Intermediate", "Advanced"].includes(level)) {
    query = query.eq("level", level);
  }
  if (isFree === "1") query = query.eq("is_free", true);
  if (isFree === "0") query = query.eq("is_free", false);

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: courses } = await query;
  const { data: cats } = await supabase
    .from("categories")
    .select("slug, name")
    .order("display_order", { ascending: true });

  const instructorIds = [
    ...new Set((courses ?? []).map((c) => c.instructor_id).filter(Boolean)),
  ] as string[];
  const { data: instructors } = instructorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", instructorIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const nameById = new Map(
    (instructors ?? []).map((p) => [p.id, p.full_name])
  );

  const list = (courses ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    short_description: c.short_description,
    thumbnail_url: c.thumbnail_url,
    price: c.price,
    original_price: c.original_price,
    is_free: c.is_free,
    total_lessons: c.total_lessons,
    total_duration_minutes: c.total_duration_minutes,
    instructor: c.instructor_id
      ? { full_name: nameById.get(c.instructor_id) ?? null }
      : null,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <h1 className="font-display text-4xl font-bold">All courses</h1>
        <p className="mt-2 text-muted-foreground">
          Search, filter, and find your next healthy cooking win.
        </p>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4"
      >
        <Input
          name="q"
          placeholder="Search…"
          defaultValue={q}
          className="w-full sm:flex-1"
        />
        <select
          name="category"
          defaultValue={category || ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-36"
        >
          <option value="">All categories</option>
          {(cats ?? []).map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="level"
          defaultValue={level || ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-36"
        >
          <option value="">Any level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select
          name="free"
          defaultValue={isFree || ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-36"
        >
          <option value="">Free & Paid</option>
          <option value="1">Free only</option>
          <option value="0">Paid only</option>
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-36"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low → high</option>
          <option value="price_desc">Price: high → low</option>
        </select>
        <div className="flex gap-2">
          <Button type="submit">Apply</Button>
          <Button type="reset" variant="outline" asChild>
            <Link href="/courses">Reset</Link>
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted-foreground">
        {list.length} course{list.length !== 1 ? "s" : ""} found
      </p>

      {list.length === 0 ? (
        <p className="text-center text-muted-foreground">No courses match.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
