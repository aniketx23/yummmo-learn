import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { Card, CardContent } from "@/components/ui/card";
import { FadeInSection } from "@/components/fade-in-section";
import { HeroSlideshow } from "@/components/hero-slideshow";
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
            <h1 className="font-display text-4xl font-bold leading-tight text-charcoal md:text-5xl lg:text-6xl">
              Where Indulgence Meets{" "}
              <span className="text-primary">Wellness.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Premium healthy bakes crafted with oats, ragi, jaggery & millets
              — preservative-free, eggless & made with love. Ab seekho ghar pe
              banana — Akta Mahajan ke saath.
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
            <HeroSlideshow
              slides={[
                {
                  src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_20230719_183424.jpg",
                  caption: "Crafted with jaggery. Zero refined sugar.",
                  tag: "Healthy Dry Cakes",
                },
                {
                  src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/Gemini_Generated_Image_7nhen77nhen77nhe.png",
                  caption: "Almond atta cake — maida-free perfection.",
                  tag: "Signature Bakes",
                },
                {
                  src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.41.52_4395e100.jpg",
                  caption: "Custom designer cakes — made to your vision.",
                  tag: "Designer Cakes",
                },
                {
                  src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.41.52_ff896845.jpg",
                  caption: "Cookie bouquets — the sweetest gift.",
                  tag: "Gifting",
                },
                {
                  src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.55.46_a6dcfacb.jpg",
                  caption: "Premium hampers — handcrafted with love.",
                  tag: "Hampers",
                },
              ]}
            />
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
        <div className="grid gap-6 sm:grid-cols-3">
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

      {/* ── Yummmo Products Showcase ─────────────────────────── */}
      <FadeInSection delay={0.1}>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Our Creations
          </p>
          <h2 className="font-display text-3xl font-bold text-charcoal">
            Crafted with Purpose. Baked with Love.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Every product at Yummmo is made with healthier ingredients —
            no maida, no refined sugar, no preservatives. Just real,
            wholesome goodness.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[
            {
              src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_20230719_183424.jpg",
              name: "Healthy Dry Cakes",
              tag: "Sugar-Free",
              tagColor: "bg-green-100 text-green-700",
            },
            {
              src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/Gemini_Generated_Image_7nhen77nhen77nhe.png",
              name: "Almond Atta Cake",
              tag: "Maida-Free",
              tagColor: "bg-amber-100 text-amber-700",
            },
            {
              src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.41.52_4395e100.jpg",
              name: "Designer Cakes",
              tag: "Custom Orders",
              tagColor: "bg-purple-100 text-purple-700",
            },
            {
              src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.41.52_ff896845.jpg",
              name: "Cookie Bouquets",
              tag: "Gifting",
              tagColor: "bg-red-100 text-red-700",
            },
            {
              src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.55.46_a3571f8d.jpg",
              name: "Oat Cookies",
              tag: "Healthy Snacking",
              tagColor: "bg-orange-100 text-orange-700",
            },
            {
              src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.55.46_a6dcfacb.jpg",
              name: "Premium Hampers",
              tag: "Corporate Gifts",
              tagColor: "bg-pink-100 text-pink-700",
            },
            {
              src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2002.05.09_79b2cc62.jpg",
              name: "Chocolate Ganache",
              tag: "Signature Product",
              tagColor: "bg-yellow-100 text-yellow-700",
            },
            {
              src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/FB_IMG_1640449048164.jpg",
              name: "Celebration Cakes",
              tag: "Made to Order",
              tagColor: "bg-blue-100 text-blue-700",
            },
          ].map((item) => (
            <div
              key={item.name}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              <div className="p-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${item.tagColor}`}
                >
                  {item.tag}
                </span>
                <p className="mt-1 text-sm font-semibold text-charcoal">
                  {item.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Want to learn to make these at home?
          </p>
          <Button asChild size="pill" className="mt-3">
            <Link href="/courses">Start Learning Free &rarr;</Link>
          </Button>
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

      {/* ── Signature: Chocolate Ganache ─────────────────────── */}
      <FadeInSection delay={0.1}>
      <section className="bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-800 py-16 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl md:max-w-full">
            <Image
              src="https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2002.05.09_79b2cc62.jpg"
              alt="Yummmo Signature Chocolate Ganache"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
                Signature Product
              </p>
              <h2 className="mt-2 font-display text-4xl font-bold">
                The Yummmo Chocolate Ganache
              </h2>
            </div>

            <p className="text-lg leading-relaxed text-white/80">
              Rich, velvety, and indulgent — our signature dark chocolate
              ganache is crafted without refined sugar. Made with premium dark
              chocolate, fresh cream, and a touch of jaggery. Available in
              jars for home use and bulk orders for bakeries.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🍫", text: "Premium Dark Chocolate" },
                { icon: "🌿", text: "No Refined Sugar" },
                { icon: "✅", text: "Preservative Free" },
                { icon: "🎁", text: "Available in Jars" },
              ].map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2"
                >
                  <span>{f.icon}</span>
                  <span className="text-sm font-medium">{f.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-amber-400 font-bold text-amber-900 hover:bg-amber-300"
              >
                <Link href="/live-classes">Learn to Make It &rarr;</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/40 text-white hover:bg-white/10"
              >
                <a
                  href="https://wa.me/918459999991?text=Hi%2C%20I%27d%20like%20to%20order%20the%20chocolate%20ganache"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Order on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </FadeInSection>

      {/* ── Meet Akta Mahajan (H1) ───────────────────────────── */}
      <FadeInSection delay={0.1}>
      <section className="bg-gradient-to-r from-primary/10 via-cream to-herb/10 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-3xl border-4 border-primary/20 shadow-2xl">
            <Image
              src="https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_6884.jpg"
              alt="Akta Mahajan — Founder, Yummmo"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur-sm">
              <p className="text-center text-xs font-semibold text-charcoal">
                🏆 Featured in Zee News &amp; Economic Times
              </p>
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
              Akta Mahajan is the founder of Yummmo — a premium healthy
              bakery that has redefined indulgence for hundreds of Indian
              families. Featured in <strong>Zee News</strong> and{" "}
              <strong>Economic Times</strong>, Akta has built a community
              around one powerful belief: healthy food should never
              compromise on taste.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Ab woh yahi secrets aapko sikhana chahti hain — ghar ki rasoi
              mein, aapki apni raften mein.
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

      {/* ── Premium Lifestyle Selling Points ────────────────── */}
      <FadeInSection delay={0.1}>
      <section className="border-y bg-white/70 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-charcoal">
              A New Way to Eat. A Better Way to Live.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Yummmo is not just a bakery — it&apos;s a movement towards
              conscious, joyful eating.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🌾",
                title: "Real Ingredients Only",
                desc: "Oats, ragi, millets, jaggery, dates — nothing artificial, nothing refined. Ever.",
                accent: "border-t-4 border-green-400",
                bg: "bg-green-50",
              },
              {
                icon: "✨",
                title: "Indulgence, Reimagined",
                desc: "Premium taste without the guilt. Because healthy and delicious are not opposites.",
                accent: "border-t-4 border-amber-400",
                bg: "bg-amber-50",
              },
              {
                icon: "🏠",
                title: "Made for Indian Kitchens",
                desc: "Every recipe designed for your home oven, your local ingredients, your family's palate.",
                accent: "border-t-4 border-orange-400",
                bg: "bg-orange-50",
              },
              {
                icon: "🎓",
                title: "Learn Once, Cook Forever",
                desc: "Master the art of healthy swaps — skills that transform every meal you make, forever.",
                accent: "border-t-4 border-purple-400",
                bg: "bg-purple-50",
              },
            ].map((stat) => (
              <div
                key={stat.title}
                className={`rounded-2xl ${stat.bg} ${stat.accent} p-6 shadow-sm transition-shadow duration-300 hover:shadow-md`}
              >
                <span className="text-3xl">{stat.icon}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-charcoal">
                  {stat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeInSection>
    </div>
  );
}
