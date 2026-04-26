import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";
import { FadeInSection } from "@/components/fade-in-section";
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
    emoji: "🎂",
    bg: "bg-amber-50",
    border: "border-l-4 border-amber-400",
    iconBg: "bg-amber-100",
  },
  {
    name: "Healthy Swaps",
    slug: "healthy-swaps",
    blurb: "Sugar-free mithai, better oils",
    emoji: "🌿",
    bg: "bg-green-50",
    border: "border-l-4 border-green-400",
    iconBg: "bg-green-100",
  },
  {
    name: "Indian Cooking",
    slug: "indian-cooking",
    blurb: "Ghar ka khana, smarter choices",
    emoji: "🍲",
    bg: "bg-orange-50",
    border: "border-l-4 border-orange-400",
    iconBg: "bg-orange-100",
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
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-cream via-white to-primary/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl animate-blob" />
          <div className="absolute top-40 -right-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl animate-blob-delay-2" />
          <div className="absolute -bottom-10 left-1/3 h-64 w-64 rounded-full bg-green-100/40 blur-3xl animate-blob-delay-4" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:py-24">
          <div className="flex-1 space-y-6 animate-[fade-up_0.6s_ease-out_forwards]">
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
          <div className="relative flex-1 opacity-0 animate-[fade-up_0.6s_ease-out_0.2s_forwards]">
            <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-3xl border bg-white shadow-xl sm:aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
                alt="Indian kitchen cooking"
                fill
                className="object-cover"
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

      {/* ── Marquee trust strip ──────────────────────────────── */}
      <div className="overflow-hidden border-y bg-white/60 py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {[
            "🏆 Featured in Zee News",
            "📰 Economic Times",
            "👩‍🍳 100+ Students Trained",
            "🎂 10+ Years Baking Experience",
            "📍 Based in Noida",
            "🌿 Healthy Ingredients Only",
            "✅ Preservative Free",
            "🏆 Featured in Zee News",
            "📰 Economic Times",
            "👩‍🍳 100+ Students Trained",
            "🎂 10+ Years Baking Experience",
            "📍 Based in Noida",
            "🌿 Healthy Ingredients Only",
            "✅ Preservative Free",
          ].map((item, i) => (
            <span
              key={i}
              className="mx-8 text-sm font-medium text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Featured Categories (H4) ─────────────────────────── */}
      <FadeInSection>
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
            <Link key={c.slug} href={`/categories/${c.slug}`}>
              <Card className={`h-full ${c.bg} ${c.border} transition hover:-translate-y-1 hover:shadow-md`}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg} text-2xl`}>
                    {c.emoji}
                  </div>
                  <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.blurb}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      </FadeInSection>

      {/* ── Popular Courses ──────────────────────────────────── */}
      <FadeInSection delay={0.1}>
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
              Admin &rarr; Courses.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {popularList.map((c) => (
                <CourseCard key={c.id as string} course={c as never} enrolled={enrolledIds.has(c.id as string)} />
              ))}
            </div>
          )}
        </div>
      </section>
      </FadeInSection>

      {/* ── Free Courses ─────────────────────────────────────── */}
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

      {/* ── Live Classes Urgency Strip (H3) ──────────────────── */}
      <FadeInSection delay={0.1}>
      <section className="bg-gradient-to-r from-primary to-amber-500 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="text-center text-white sm:text-left">
            <p className="font-display text-lg font-bold">
              🎂 Live Baking Classes — Noida
            </p>
            <p className="text-sm text-white/90">
              Akta Mahajan ke saath seekho &middot; Sirf ₹500 mein &middot; Limited seats!
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 rounded-full bg-white px-6 font-bold text-primary hover:bg-white/90"
          >
            <Link href="/live-classes">Book Your Spot &rarr;</Link>
          </Button>
        </div>
      </section>
      </FadeInSection>

      {/* ── Meet Akta Mahajan (H1) ───────────────────────────── */}
      <FadeInSection delay={0.1}>
      <section className="bg-gradient-to-r from-primary/10 via-cream to-herb/10 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="relative flex items-center justify-center">
            <div className="relative h-80 w-80 overflow-hidden rounded-3xl border-4 border-primary/20 bg-gradient-to-br from-primary/20 to-amber-100 shadow-2xl">
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-9xl font-bold text-primary/30">A</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur-sm">
                <p className="text-center text-xs font-semibold text-charcoal">
                  🏆 Featured in Zee News &amp; Economic Times
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Meet Your Instructor
              </p>
              <h2 className="mt-2 font-display text-4xl font-bold text-charcoal">
                Akta Mahajan
              </h2>
              <p className="mt-1 text-lg text-muted-foreground">
                Founder, Yummmo Bakery &middot; Master Baker &amp; Healthy Food Expert
              </p>
            </div>

            <p className="leading-relaxed text-muted-foreground">
              10+ saalon ki baking expertise ke saath, Akta ne hundreds of
              families ko sikhaaya hai ki healthy khana boring nahi hota.
              Zee News aur Economic Times mein featured, Akta ki classes
              Noida mein ek movement ban gayi hain — ek cake at a time.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                🏆 Zee News Featured
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                📰 Economic Times
              </span>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                👩‍🍳 100+ Students Trained
              </span>
              <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                🎂 10+ Years Experience
              </span>
            </div>

            <Button asChild size="pill">
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>
        </div>
      </section>
      </FadeInSection>

      {/* ── Trust Stats (H2) ─────────────────────────────────── */}
      <FadeInSection delay={0.1}>
      <section className="border-y bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-charcoal">
              Why Yummmo Learn?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Real learning, real results — aapki apni rasoi mein
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { number: "9", label: "Lessons", sub: "In our first course" },
              { number: "100%", label: "Free", sub: "Start learning today" },
              { number: "Hindi", label: "& Hinglish", sub: "Easy to understand" },
              { number: "0g", label: "Maida", sub: "Healthy swaps only" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/60 bg-cream p-6 text-center shadow-sm"
              >
                <p className="font-display text-4xl font-bold text-primary">
                  <AnimatedCounter value={stat.number} />
                </p>
                <p className="mt-1 font-semibold text-charcoal">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeInSection>
    </div>
  );
}
