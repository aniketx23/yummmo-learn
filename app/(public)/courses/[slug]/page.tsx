import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CoursePurchase } from "@/components/course-purchase";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, PlayCircle, Users } from "lucide-react";

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

  const [{ data: category }, { data: instructor }, countRes] = await Promise.all([
    course.category_id
      ? supabase
          .from("categories")
          .select("name")
          .eq("id", course.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    course.instructor_id
      ? supabase
          .from("profiles")
          .select("full_name")
          .eq("id", course.instructor_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
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

  const enrollmentCount = countRes.count ?? 0;

  const learnPoints = [
    "Poori cake recipe step-by-step video mein",
    "Healthy swaps — maida ki jagah atta, chini ki jagah gud",
    "Chef tips jo cake ko perfect banate hain",
    "Ghar par ingredients aur measurements",
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{course.language}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              {category?.name && <Badge>{category.name}</Badge>}
              <Badge variant="herb">Workshop tutorial</Badge>
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

          {enrollmentCount > 0 && (
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                {enrollmentCount} students
              </span>
            </div>
          )}

          {course.description && (
            <div>
              <h2 className="font-display text-2xl font-bold">
                About this tutorial
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                {course.description}
              </p>
            </div>
          )}

          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 font-display text-2xl font-bold">
              Is video mein kya milega?
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
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-primary/20 shadow-md">
            <CardContent className="space-y-4 p-6">
              <div>
                {enrollment ? (
                  <p className="font-display text-2xl font-bold text-herb">
                    You have access
                  </p>
                ) : (
                  <p className="font-display text-xl font-bold">
                    Workshop tutorial
                  </p>
                )}
              </div>
              <Separator />
              <CoursePurchase
                courseSlug={course.slug}
                isLoggedIn={!!user}
                enrolled={!!enrollment}
              />
              {!enrollment && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Yeh tutorial humare in-person workshop attend karne wale
                    students ko milta hai.
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
