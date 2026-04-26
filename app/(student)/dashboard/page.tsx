import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/course-card";
import { formatDurationMinutes, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My Dashboard" };

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: enrollRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, phone")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("enrollments")
      .select(
        "course_id, enrolled_at, courses(id, slug, title, short_description, thumbnail_url, price, original_price, is_free, total_lessons, total_duration_minutes)"
      )
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false }),
  ]);

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
  let totalCompleted = 0;
  for (const p of progressRows ?? []) {
    if (!p.is_completed) continue;
    totalCompleted++;
    completedByCourse.set(
      p.course_id,
      (completedByCourse.get(p.course_id) ?? 0) + 1
    );
  }

  // Categorize courses
  const inProgress: CourseRow[] = [];
  const completed: CourseRow[] = [];
  const notStarted: CourseRow[] = [];

  for (const c of courses) {
    const total = lessonsByCourse.get(c.id) ?? 0;
    const done = completedByCourse.get(c.id) ?? 0;
    if (total > 0 && done >= total) {
      completed.push(c);
    } else if (done > 0) {
      inProgress.push(c);
    } else {
      notStarted.push(c);
    }
  }

  const coursesCompleted = completed.length;

  // New courses the student hasn't enrolled in
  const { data: newCourses } = await supabase
    .from("courses")
    .select(
      "id, slug, title, short_description, thumbnail_url, price, original_price, is_free, total_lessons, total_duration_minutes, instructor_id"
    )
    .eq("is_published", true)
    .not("id", "in", courseIds.length ? `(${courseIds.join(",")})` : "(00000000-0000-0000-0000-000000000000)")
    .limit(4);

  function renderCourseCard(c: CourseRow) {
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
              <Image
                src={c.thumbnail_url}
                alt=""
                fill
                className="object-cover"
                sizes="144px"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold">
                  {c.title}
                </h3>
                {isComplete && (
                  <Badge variant="herb" className="text-xs">
                    Completed
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {c.total_lessons} lessons
                {c.total_duration_minutes > 0 &&
                  ` · ${formatDurationMinutes(c.total_duration_minutes)}`}
                {" · "}
                {c.is_free ? "Free" : formatPrice(price)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{pct}% complete</span>
                <span>
                  {done}/{total} lessons
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href={`/learn/${c.slug}`}>
                {isComplete ? "Review" : "Continue"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Namaste{profile?.full_name ? `, ${profile.full_name}` : ""}!
          </h1>
          <p className="text-muted-foreground">
            Continue your healthy cooking journey.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>

      {/* ── Phone missing banner ──────────────────────────────────── */}
      {!profile?.phone && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display font-semibold text-primary">
              Phone number add karein
            </p>
            <p className="text-sm text-muted-foreground">
              Class updates aur important notifications ke liye aapka number chahiye.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/profile?complete=1">Add phone number</Link>
          </Button>
        </div>
      )}

      {/* ── Stats ───────────────────────────────────────────────── */}
      {courses.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-xs text-muted-foreground">Courses enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Lessons completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{coursesCompleted}</p>
              <p className="text-xs text-muted-foreground">Courses finished</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Continue Learning (in progress) ─────────────────────── */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">
            Jaari Hai
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {inProgress.map(renderCourseCard)}
          </div>
        </section>
      )}

      {/* ── Not Started ─────────────────────────────────────────── */}
      {notStarted.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">
            Shuru Nahi Kiya
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {notStarted.map(renderCourseCard)}
          </div>
        </section>
      )}

      {/* ── Completed ───────────────────────────────────────────── */}
      {completed.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold">Poora Ho Gaya! 🎉</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {completed.map(renderCourseCard)}
          </div>
        </section>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {courses.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            You haven&apos;t enrolled in any courses yet.{" "}
            <Link href="/courses" className="text-primary underline">
              Explore courses
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ── Explore New Courses ──────────────────────────────────── */}
      {(newCourses ?? []).length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">
              Explore New Courses
            </h2>
            <Button variant="link" asChild className="text-primary">
              <Link href="/courses">View all</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(newCourses ?? []).map((c) => (
              <CourseCard key={c.id} course={c as never} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
