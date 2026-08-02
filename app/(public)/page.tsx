import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course-card";
import { FadeInSection } from "@/components/fade-in-section";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { MyTutorials, type MyTutorial } from "@/components/my-tutorials";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Healthy Baking Workshops — Akta Mahajan",
  description:
    "Learn healthy baking with Akta Mahajan — small, hands-on, in-person batches. No refined flour, no sugar. Every class comes with a recorded video.",
  openGraph: {
    title: "Yummmo Learn — Healthy Baking Workshops with Akta Mahajan",
    description:
      "Small batch, hands-on. No refined flour — whole wheat. No sugar — jaggery. Same taste.",
    type: "website",
    siteName: "Yummmo Learn",
    locale: "en_IN",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Healthy baking workshops with Akta Mahajan",
      },
    ],
  },
};

const WA = "918459999991";
const TEL = "+918459999991";

const workshopPoints = [
  {
    icon: "👐",
    title: "Hands-on baking",
    desc: "You bake it yourself — you do not just watch. The whole cake with your own hands.",
    accent: "border-t-4 border-orange-400",
    bg: "bg-orange-50",
  },
  {
    icon: "👩‍🍳",
    title: "Small batch",
    desc: "Few people, personal attention. Every question gets an answer.",
    accent: "border-t-4 border-green-400",
    bg: "bg-green-50",
  },
  {
    icon: "🌿",
    title: "Healthy swaps",
    desc: "No refined flour — whole wheat, oats, ragi. No sugar — jaggery and dates. Eggless.",
    accent: "border-t-4 border-amber-400",
    bg: "bg-amber-50",
  },
  {
    icon: "🎥",
    title: "Take the video home",
    desc: "After class you get a recorded video of every recipe plus a PDF — to bake again at home.",
    accent: "border-t-4 border-purple-400",
    bg: "bg-purple-50",
  },
];

const orderProducts = [
  {
    src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_20230719_183424.jpg",
    name: "Healthy Dry Cakes",
    tag: "Sweetened with jaggery",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/Gemini_Generated_Image_7nhen77nhen77nhe.png",
    name: "Almond Whole Wheat Cake",
    tag: "No refined flour",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2002.05.09_79b2cc62.jpg",
    name: "Chocolate Ganache",
    tag: "Signature",
    tagColor: "bg-yellow-100 text-yellow-700",
  },
  {
    src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.55.46_a3571f8d.jpg",
    name: "Oat Cookies",
    tag: "Healthy snacking",
    tagColor: "bg-orange-100 text-orange-700",
  },
  {
    src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.41.52_4395e100.jpg",
    name: "Designer Cakes",
    tag: "Custom order",
    tagColor: "bg-purple-100 text-purple-700",
  },
  {
    src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.41.52_ff896845.jpg",
    name: "Cookie Bouquets",
    tag: "Gifting",
    tagColor: "bg-red-100 text-red-700",
  },
  {
    src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.55.46_a6dcfacb.jpg",
    name: "Premium Hampers",
    tag: "Corporate gifts",
    tagColor: "bg-pink-100 text-pink-700",
  },
  {
    src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/FB_IMG_1640449048164.jpg",
    name: "Celebration Cakes",
    tag: "Made to order",
    tagColor: "bg-blue-100 text-blue-700",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: published } = await supabase
    .from("courses")
    .select(
      "id, slug, title, short_description, thumbnail_url, total_lessons, total_duration_minutes, instructor_id"
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const instructorIds = [
    ...new Set((published ?? []).map((c) => c.instructor_id).filter(Boolean)),
  ] as string[];

  const { data: instructors } = instructorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", instructorIds)
    : { data: [] as { id: string; full_name: string | null }[] };

  const nameById = new Map((instructors ?? []).map((p) => [p.id, p.full_name]));

  const tutorialList = (published ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    short_description: c.short_description,
    thumbnail_url: c.thumbnail_url,
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

  // Granted tutorials for the signed-in student, shown right under the hero.
  const { data: myCourses } =
    user && enrolledIds.size > 0
      ? await supabase
          .from("courses")
          .select(
            "id, slug, title, short_description, thumbnail_url, total_lessons"
          )
          .in("id", [...enrolledIds])
          .eq("is_published", true)
      : {
          data: [] as {
            id: string;
            slug: string;
            title: string;
            short_description: string | null;
            thumbnail_url: string | null;
            total_lessons: number;
          }[],
        };

  const { data: myProgress } =
    user && enrolledIds.size > 0
      ? await supabase
          .from("progress")
          .select("course_id")
          .eq("student_id", user.id)
          .eq("is_completed", true)
      : { data: [] as { course_id: string }[] };

  const doneBy = new Map<string, number>();
  for (const p of myProgress ?? []) {
    doneBy.set(p.course_id, (doneBy.get(p.course_id) ?? 0) + 1);
  }

  const myTutorials: MyTutorial[] = (myCourses ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    short_description: c.short_description,
    thumbnail_url: c.thumbnail_url,
    completed: c.total_lessons > 0 && (doneBy.get(c.id) ?? 0) >= c.total_lessons,
  }));

  const { data: myProfile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };
  const firstName = myProfile?.full_name?.trim().split(/\s+/)[0] ?? null;

  return (
    <div>
      {/* ═══════════ PART 1 — THE WORKSHOP ═══════════ */}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-cream via-white to-primary/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl animate-blob" />
          <div className="absolute top-40 -right-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl animate-blob-delay-2" />
          <div className="absolute -bottom-10 left-1/3 h-64 w-64 rounded-full bg-green-100/40 blur-3xl animate-blob-delay-4" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:py-24">
          <div className="flex-1 space-y-6 animate-[fade-up_0.6s_ease-out_forwards]">
            <span className="inline-flex items-center gap-2 rounded-full bg-herb/10 px-4 py-1.5 text-sm font-semibold text-herb">
              📍 In-person &middot; Small batch
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-charcoal md:text-5xl lg:text-6xl">
              Learn to bake —{" "}
              <span className="text-primary">with your own hands.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Learn from Akta Mahajan in a small, hands-on batch. No refined
              flour, no sugar. Same taste, zero guilt.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="pill" className="w-full sm:w-auto" asChild>
                <Link href="/live-classes">
                  Ask about the workshop
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="pill"
                className="w-full sm:w-auto"
                asChild
              >
                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(
                    "Hello! I want to know more about your baking workshop."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Message on WhatsApp
                </a>
              </Button>
            </div>
          </div>
          <div className="relative flex-1 opacity-0 animate-[fade-up_0.6s_ease-out_0.2s_forwards]">
            <HeroSlideshow
              slides={[
                {
                  src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_20230719_183424.jpg",
                  caption: "Sweetened with jaggery. No refined sugar at all.",
                  tag: "Healthy Dry Cakes",
                },
                {
                  src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/Gemini_Generated_Image_7nhen77nhen77nhe.png",
                  caption: "Almond whole wheat cake — no refined flour.",
                  tag: "Signature Bakes",
                },
                {
                  src: "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.55.46_a3571f8d.jpg",
                  caption: "Oat cookies — an everyday healthy snack.",
                  tag: "Everyday Snacks",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Your granted tutorials (signed-in students only) ── */}
      <MyTutorials tutorials={myTutorials} firstName={firstName} />

      {/* ── Honest trust strip ───────────────────────────────── */}
      <div className="overflow-hidden border-y bg-white/60 py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {[
            "🌿 Eggless & preservative-free",
            "🍰 No refined flour — whole wheat, oats, ragi",
            "🍯 No sugar — jaggery and dates",
            "👩‍🍳 25+ years of home kitchen",
            "📍 Small batch — in-person",
            "🎥 A recorded video of every class",
          ]
            .concat([
              "🌿 Eggless & preservative-free",
              "🍰 No refined flour — whole wheat, oats, ragi",
              "🍯 No sugar — jaggery and dates",
              "👩‍🍳 25+ years of home kitchen",
              "📍 Small batch — in-person",
              "🎥 A recorded video of every class",
            ])
            .map((item, i) => (
              <span
                key={i}
                className="mx-8 text-sm font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
        </div>
      </div>

      {/* ── What happens in a workshop ───────────────────────── */}
      <FadeInSection>
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
              In-person workshop
            </p>
            <h2 className="font-display text-3xl font-bold text-charcoal">
              What happens in a workshop?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              One day, one kitchen, and a cake made by your own hands — to take
              home.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workshopPoints.map((p) => (
              <div
                key={p.title}
                className={`rounded-2xl ${p.bg} ${p.accent} p-6 shadow-sm transition-shadow duration-300 hover:shadow-md`}
              >
                <span className="text-3xl">{p.icon}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-charcoal">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button size="pill" asChild>
              <Link href="/live-classes">
                See the next batch
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </FadeInSection>

      {/* ── Meet Akta ────────────────────────────────────────── */}
      <FadeInSection delay={0.1}>
        <section className="bg-gradient-to-r from-primary/10 via-cream to-herb/10 py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-3xl border-4 border-primary/20 shadow-2xl">
              <Image
                src="https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_6884.jpg"
                alt="Akta Mahajan"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Your instructor
                </p>
                <h2 className="mt-2 font-display text-4xl font-bold text-charcoal">
                  Akta Mahajan
                </h2>
                <p className="mt-1 text-lg text-muted-foreground">
                  Self-taught baker &middot; 25+ years of home kitchen
                </p>
              </div>

              <p className="leading-relaxed text-muted-foreground">
                Akta never went to culinary school — she learnt everything in
                her own kitchen. In 2017 her elder child weighed 120 kg. With
                changes in food and lifestyle, that came down to 54 kg in three
                years.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                The same healthy swaps — whole wheat instead of refined flour,
                jaggery instead of sugar — are what she teaches you now. Without
                losing the taste.
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "👩‍🍳 25+ years home baking",
                  "🌱 Eggless & preservative-free",
                  "📍 In-person batches",
                  "❤️ Whole wheat, jaggery, oats — no refined flour",
                ].map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-charcoal"
                  >
                    {b}
                  </span>
                ))}
              </div>

              <Button asChild size="pill">
                <Link href="/live-classes">Ask about the workshop</Link>
              </Button>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── Recorded tutorials (after-class perk) ────────────── */}
      {tutorialList.length > 0 && (
        <FadeInSection delay={0.1}>
          <section className="border-y bg-white/70 py-16">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <h2 className="font-display text-3xl font-bold">
                    After the workshop — your recorded tutorials
                  </h2>
                  <p className="text-muted-foreground">
                    One full video and a recipe PDF for every class, to bake
                    again at home. Access is given after you attend the
                    workshop.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/courses">See all</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tutorialList.map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    enrolled={enrolledIds.has(c.id)}
                  />
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>
      )}

      {/* ── Workshop CTA strip ───────────────────────────────── */}
      <FadeInSection delay={0.1}>
        <section className="bg-gradient-to-r from-primary to-amber-500 py-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
            <div className="text-center text-white sm:text-left">
              <p className="font-display text-lg font-bold">
                🎂 Next baking workshop
              </p>
              <p className="text-sm text-white/90">
                Small batch, personal attention. Send one message to ask about
                a seat.
              </p>
            </div>
            <Button
              asChild
              className="shrink-0 rounded-full bg-white px-6 font-bold text-primary hover:bg-white/90"
            >
              <Link href="/live-classes">See batches &rarr;</Link>
            </Button>
          </div>
        </section>
      </FadeInSection>

      {/* ═══════════ PART 2 — ORDER CAKES ═══════════ */}
      <FadeInSection delay={0.1}>
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-herb">
              Yummmo Bakery
            </p>
            <h2 className="font-display text-3xl font-bold text-charcoal">
              Or, just order from us.
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              No time to learn? No problem. Same healthy ingredients, same care
              — order cakes, cookies, ganache and hampers from Yummmo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {orderProducts.map((item) => (
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

          <div className="mt-10 rounded-2xl border bg-cream p-6 text-center">
            <p className="font-display text-xl font-bold text-charcoal">
              Want to order?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Message us on WhatsApp or just call us — we will tell you
              everything.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="pill"
                className="bg-[#25D366] text-white hover:bg-[#22c55e]"
              >
                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(
                    "Hello! I want to order a cake or hamper from Yummmo."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Order on WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="pill" asChild>
                <a href={`tel:${TEL}`}>
                  <Phone className="h-4 w-4" />
                  Call us
                </a>
              </Button>
            </div>
          </div>
        </section>
      </FadeInSection>
    </div>
  );
}
