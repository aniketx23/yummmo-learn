import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDurationMinutes, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My Courses" };

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: enrollRows } = await supabase
    .from("enrollments")
    .select(
      "course_id, enrolled_at, courses(id, slug, title, short_description, thumbnail_url, price, original_price, is_free, total_lessons, total_duration_minutes)"
    )
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false });

  type CourseRow = {
    id: string;
    slug: string;
    title: string;
    short_description: string | null;
    thumbnail_url: string | null;
    price: string | number;
    original_price: string | number | null;
    is_free: boolean;
    total_lessons: number;
    total_duration_minutes: number;
  };

  const courses =
    enrollRows
      ?.map((e) => e.courses)
      .filter(Boolean)
      .map((c) => (Array.isArray(c) ? c[0] : c) as CourseRow) ?? [];

  const courseIds = courses.map((c) => c.id);

  const { data: progressRows } = courseIds.length
    ? await supabase
        .from("progress")
        .select("course_id, is_completed")
        .eq("student_id", user.id)
        .in("course_id", courseIds)
    : { data: [] as { course_id: string; is_completed: boolean }[] };

  const completedByCourse = new Map<string, number>();
  const lessonsByCourse = new Map(
    courses.map((c) => [c.id, c.total_lessons || 0])
  );
  for (const p of progressRows ?? []) {
    if (!p.is_completed) continue;
    completedByCourse.set(
      p.course_id,
      (completedByCourse.get(p.course_id) ?? 0) + 1
    );
  }

  const inProgress: CourseRow[] = [];
  const completed: CourseRow[] = [];
  const notStarted: CourseRow[] = [];

  for (const c of courses) {
    const total = lessonsByCourse.get(c.id) ?? 0;
    const done = completedByCourse.get(c.id) ?? 0;
    if (total > 0 && done >= total) completed.push(c);
    else if (done > 0) inProgress.push(c);
    else notStarted.push(c);
  }

  function renderCard(c: CourseRow) {
    const total = lessonsByCourse.get(c.id) ?? 0;
    const done = completedByCourse.get(c.id) ?? 0;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const isComplete = total > 0 && done >= total;
    const price =
      typeof c.price === "string" ? parseFloat(c.price) : c.price;

    return (
      <Card key={c.id} className="overflow-hidden">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:p-6">
          <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-36">
            {c.thumbnail_url ? (
              <Image src={c.thumbnail_url} alt="" fill className="object-cover" sizes="144px" />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-semibold">{c.title}</h3>
              {isComplete && <Badge variant="herb" className="text-xs">Completed</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              {c.total_lessons} lessons{c.total_duration_minutes > 0 && ` · ${formatDurationMinutes(c.total_duration_minutes)}`} · {c.is_free ? "Free" : formatPrice(price)}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{pct}% complete</span>
                <span>{done}/{total} lessons</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href={`/learn/${c.slug}`}>{isComplete ? "Review" : "Continue"}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <h1 className="font-display text-3xl font-bold">My Courses</h1>

      {courses.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            You haven&apos;t enrolled in any courses yet.{" "}
            <Link href="/courses" className="text-primary underline">Explore courses</Link>
          </CardContent>
        </Card>
      )}

      {inProgress.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold">In Progress</h2>
          <div className="grid gap-6 md:grid-cols-2">{inProgress.map(renderCard)}</div>
        </section>
      )}

      {notStarted.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold">Not Started</h2>
          <div className="grid gap-6 md:grid-cols-2">{notStarted.map(renderCard)}</div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold">Completed</h2>
          <div className="grid gap-6 md:grid-cols-2">{completed.map(renderCard)}</div>
        </section>
      )}
    </div>
  );
}
