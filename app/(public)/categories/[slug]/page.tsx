import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .maybeSingle();
  const name = cat?.name ?? slug;
  return {
    title: `${name} Courses`,
    description: `Healthy ${name.toLowerCase()} courses in simple, easy English. Learn smart ingredient swaps.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!cat) notFound();

  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id, slug, title, short_description, thumbnail_url, price, original_price, is_free, total_lessons, total_duration_minutes, instructor_id"
    )
    .eq("is_published", true)
    .eq("category_id", cat.id)
    .order("created_at", { ascending: false });

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: enrollments } = user
    ? await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user.id)
    : { data: [] as { course_id: string }[] };
  const enrolledIds = new Set((enrollments ?? []).map((e) => e.course_id));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div>
        <Link href="/courses" className="text-sm text-primary hover:underline">
          ← All courses
        </Link>
        <h1 className="mt-2 font-display text-4xl font-bold">{cat.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Courses in this category.
        </p>
      </div>
      {list.length === 0 ? (
        <Card className="border-primary/20 bg-cream">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <h2 className="font-display text-2xl font-bold text-charcoal">
              No tutorials in this category yet
            </h2>
            <p className="max-w-xl text-base text-muted-foreground">
              Yummmo Learn recipe tutorials are given after you attend an
              in-person workshop with Akta. Join a workshop — after that, the
              recording and recipe PDF are added to your account.
            </p>
            <div className="mt-2 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/live-classes">
                  Know more about the workshop
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/courses">See all tutorials</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <CourseCard key={c.id} course={c} enrolled={enrolledIds.has(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
