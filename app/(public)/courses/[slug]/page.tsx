import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CoursePurchase } from "@/components/course-purchase";
import { createClient } from "@/lib/supabase/server";
import { formatDurationMinutes, formatPrice } from "@/lib/utils";
import { CheckCircle2, Clock, Lock, PlayCircle, Users } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("title, short_description, thumbnail_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!data) return { title: "Course" };
  return {
    title: data.title,
    description: data.short_description ?? undefined,
    openGraph: data.thumbnail_url
      ? { images: [{ url: data.thumbnail_url }] }
      : undefined,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!course) notFound();

  const [{ data: category }, { data: instructor }, { data: sections }, { data: lessons }, countRes] =
    await Promise.all([
      course.category_id
        ? supabase
            .from("categories")
            .select("name, slug")
            .eq("id", course.category_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      course.instructor_id
        ? supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", course.instructor_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("sections")
        .select("id, title, display_order")
        .eq("course_id", course.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("lessons")
        .select("*")
        .eq("course_id", course.id)
        .order("display_order", { ascending: true }),
      supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("course_id", course.id),
    ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollment } = user
    ? await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", course.id)
        .eq("student_id", user.id)
        .maybeSingle()
    : { data: null };

  const price =
    typeof course.price === "string" ? parseFloat(course.price) : course.price;
  const original =
    course.original_price != null
      ? typeof course.original_price === "string"
        ? parseFloat(course.original_price)
        : course.original_price
      : null;

  const previewLesson = (lessons ?? []).find((l) => l.is_free_preview);
  const enrollmentCount = countRes.count ?? 0;

  // C5: derive "What you'll learn" from first 6 lesson titles
  const allLessonTitles = (sections ?? []).flatMap((section) =>
    (lessons ?? [])
      .filter((l) => l.section_id === section.id)
      .sort((a, b) => a.display_order - b.display_order)
      .map((l) => l.title)
  );
  const learnPoints = allLessonTitles.slice(0, 6);

  // C3: expand all sections by default
  const defaultOpenSections = (sections ?? []).map((s) => s.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{course.language}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              {category?.name && <Badge>{category.name}</Badge>}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight">
              {course.title}
            </h1>
            {course.short_description && (
              <p className="text-lg text-muted-foreground">
                {course.short_description}
              </p>
            )}
          </div>

          <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
            {course.thumbnail_url ? (
              <Image
                src={course.thumbnail_url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 66vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-herb/15">
                <PlayCircle className="h-16 w-16 text-primary" />
              </div>
            )}
          </div>

          {/* C4: Only show stats that have values */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            {enrollmentCount > 0 && (
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                {enrollmentCount} students
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              {course.total_lessons} lessons
            </span>
            {course.total_duration_minutes > 0 && (
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatDurationMinutes(course.total_duration_minutes)}
              </span>
            )}
          </div>

          {/* C1: description renders exactly once */}
          {course.description && (
            <div>
              <h2 className="font-display text-2xl font-bold">About this course</h2>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                {course.description}
              </p>
            </div>
          )}

          {/* C5: What you'll learn (derived from lesson titles) */}
          {learnPoints.length > 0 && (
            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 font-display text-2xl font-bold">
                Is course mein kya seekhenge?
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {learnPoints.map((title, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-herb" />
                    <span className="text-sm text-muted-foreground">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C3: Accordion with all sections expanded by default */}
          <div>
            <h2 className="mb-4 font-display text-2xl font-bold">Curriculum</h2>
            <Accordion type="multiple" defaultValue={defaultOpenSections} className="w-full">
              {(sections ?? []).map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger>{section.title}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {(lessons ?? [])
                        .filter((l) => l.section_id === section.id)
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((l) => {
                          const locked = !l.is_free_preview && !enrollment;
                          return (
                            <li
                              key={l.id}
                              className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm"
                            >
                              <span className="flex items-center gap-2">
                                {locked ? (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <PlayCircle className="h-4 w-4 text-primary" />
                                )}
                                {l.title}
                              </span>
                              {!locked && (
                                <Link
                                  href={`/learn/${course.slug}/${l.id}`}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  {l.is_free_preview ? "Preview" : "Open"}
                                </Link>
                              )}
                            </li>
                          );
                        })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* ── Course Resources ──────────────────────────────── */}
          {Array.isArray(course.resources) &&
            (course.resources as { type: string; name: string; url: string }[]).length > 0 && (
              <div>
                <h2 className="mb-4 font-display text-2xl font-bold">
                  Course Resources
                </h2>
                <div className="flex flex-wrap gap-3">
                  {(course.resources as { type: string; name: string; url: string }[]).map(
                    (r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-muted"
                      >
                        {r.type === "file" ? (
                          <PlayCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <Clock className="h-4 w-4 text-primary" />
                        )}
                        {r.name}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}

          {previewLesson && (
            <Card>
              <CardContent className="p-6">
                <p className="font-semibold">Free preview</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a lesson before you buy.
                </p>
                <ButtonLink
                  href={`/learn/${course.slug}/${previewLesson.id}`}
                  label="Watch free preview"
                />
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-primary/20 shadow-md">
            <CardContent className="space-y-4 p-6">
              <div>
                {enrollment ? (
                  <p className="font-display text-2xl font-bold text-herb">Enrolled</p>
                ) : course.is_free ? (
                  <p className="font-display text-3xl font-bold text-herb">Free</p>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <p className="font-display text-3xl font-bold text-primary">
                      {formatPrice(price)}
                    </p>
                    {original && original > price && (
                      <p className="text-lg text-muted-foreground line-through">
                        {formatPrice(original)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <Separator />
              <CoursePurchase
                courseId={course.id}
                courseSlug={course.slug}
                isFree={course.is_free}
                price={price}
                userEmail={user?.email}
                isLoggedIn={!!user}
                enrolled={!!enrollment}
              />
              {/* C2: conditional payment/access copy */}
              {!enrollment && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    {course.is_free
                      ? "Get instant access — no payment needed."
                      : "Secure payments with Razorpay. Instant access after purchase."}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {instructor?.full_name && (
            <Card className="mt-6">
              <CardContent className="space-y-2 p-6">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Instructor
                </p>
                <p className="font-display text-lg font-semibold">
                  {instructor.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Teaching healthy swaps with Indian kitchen realism.
                </p>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function ButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
    >
      {label}
    </Link>
  );
}
