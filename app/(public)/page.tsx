import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChefHat, Leaf, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Yummmo Learn — Healthy Cooking Courses in Hindi",
  description:
    "Learn to replace unhealthy ingredients with smart swaps — atta cakes, sugar-free mithai, healthier Indian cooking. Hindi + Hinglish courses.",
  openGraph: {
    title: "Yummmo Learn — Healthy Cooking Courses",
    description:
      "Swad bhi, sehat bhi. Indian healthy cooking courses in Hindi + Hinglish.",
    type: "website",
  },
};

const categories = [
  {
    name: "Baking",
    slug: "baking",
    blurb: "Atta cakes, healthier bakes",
    icon: ChefHat,
  },
  {
    name: "Healthy Swaps",
    slug: "healthy-swaps",
    blurb: "Sugar-free mithai, better oils",
    icon: Leaf,
  },
  {
    name: "Indian Cooking",
    slug: "indian-cooking",
    blurb: "Ghar ka khana, smarter choices",
    icon: UtensilsCrossed,
  },
];

const testimonials = [
  {
    quote:
      "Pehle lagta tha healthy = boring. Ab family ko pata bhi nahi chalta swap ka!",
    name: "Priya S.",
    place: "Pune",
  },
  {
    quote:
      "Hinglish explain bilkul ghar jaisa. Atta cake finally soft ban gayi.",
    name: "Neha R.",
    place: "Delhi NCR",
  },
  {
    quote:
      "Mom-style tips + science — best combo. Highly recommend.",
    name: "Kavita M.",
    place: "Bengaluru",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: popular } = await supabase
    .from("courses")
    .select(
      "id, slug, title, short_description, thumbnail_url, price, original_price, is_free, total_lessons, total_duration_minutes, instructor_id"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const popularIds = (popular ?? []).map((c) => c.id);

  let freeQuery = supabase
    .from("courses")
    .select(
      "id, slug, title, short_description, thumbnail_url, price, original_price, is_free, total_lessons, total_duration_minutes, instructor_id"
    )
    .eq("is_published", true)
    .eq("is_free", true)
    .limit(3);

  if (popularIds.length > 0) {
    freeQuery = freeQuery.not("id", "in", `(${popularIds.join(",")})`);
  }

  const { data: freeCourses } = await freeQuery;

  const instructorIds = [
    ...new Set(
      [...(popular ?? []), ...(freeCourses ?? [])]
        .map((c) => c.instructor_id)
        .filter(Boolean)
    ),
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

  const attachInstructor = (
    rows: NonNullable<typeof popular>
  ) =>
    rows.map((c) => ({
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

  const popularList = attachInstructor(popular ?? []);
  const freeList = attachInstructor(freeCourses ?? []);

  // Check enrolled courses for current user
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
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-cream via-white to-primary/10">
        {/* Animated background blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl animate-blob" />
          <div className="absolute top-40 -right-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl animate-blob-delay-2" />
          <div className="absolute -bottom-10 left-1/3 h-64 w-64 rounded-full bg-green-100/40 blur-3xl animate-blob-delay-4" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:py-24">
          <div className="flex-1 space-y-6">
            <h1 className="font-display text-4xl font-bold leading-tight text-charcoal md:text-5xl">
              Healthy cooking that still{" "}
              <span className="text-primary">tastes like home</span>.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Replace unhealthy ingredients with smart swaps — without losing
              swad. Built for Indian kitchens, taught with warmth.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="pill" className="w-full sm:w-auto" asChild>
                <Link href="/courses">
                  Start learning today
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="pill" className="w-full sm:w-auto" asChild>
                <Link href="/live-classes">Join Live Class</Link>
              </Button>
            </div>
          </div>
          <div className="relative flex-1">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-3xl border bg-white shadow-xl sm:aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
                alt="Indian kitchen cooking"
                fill
                className="object-cover object-center-top"
                style={{ objectPosition: "center top" }}
                priority
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-5 pt-12 text-white">
                <p className="font-display text-lg font-semibold">
                  Ghar ka khana, smarter ingredients
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-charcoal">
            Featured categories
          </h2>
          <p className="mt-2 text-muted-foreground">
            Pick a path — baking, swaps, or everyday Indian cooking.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((c) => (
            <div key={c.slug}>
              <Link href={`/categories/${c.slug}`}>
                <Card className="h-full border-border/80 transition hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <c.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.blurb}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-3xl font-bold">Popular courses</h2>
              <p className="text-muted-foreground">
                Fresh lessons, practical recipes, zero fluff.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/courses">View all</Link>
            </Button>
          </div>
          {popularList.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-cream p-8 text-center text-muted-foreground">
              Courses will appear here once your instructor publishes them in
              Admin → Courses.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {popularList.map((c) => (
                <div key={c.id as string}>
                  <CourseCard course={c as never} enrolled={enrolledIds.has(c.id as string)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {freeList.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-display text-3xl font-bold">Free courses</h2>
            <Button variant="link" asChild className="text-primary">
              <Link href="/courses?free=1">See all free</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {freeList.map((c) => (
              <CourseCard key={c.id as string} course={c as never} enrolled={enrolledIds.has(c.id as string)} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-primary/10 via-cream to-herb/10 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-white shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80"
              alt="Instructor in kitchen"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold">
              Meet your instructor
            </h2>
            <p className="text-muted-foreground">
              Years of home-kitchen experiments turned into structured courses.
              Every module is crafted for busy families who want{" "}
              <span className="font-medium text-foreground">sehat</span> without
              saying goodbye to <span className="font-medium text-foreground">swad</span>.
            </p>
            <p className="text-muted-foreground">
              Lessons blend Hindi & Hinglish — comfortable, conversational, and
              packed with practical swaps you can use tonight.
            </p>
            <Button asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center font-display text-3xl font-bold">
          What students say
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name}>
              <Card className="border-border/80 bg-white/80">
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm leading-relaxed text-charcoal/90">
                    {`"${t.quote}"`}
                  </p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.place}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
