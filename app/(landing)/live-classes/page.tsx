import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LiveClassEnroll } from "@/components/live-class-enroll";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Live Baking Classes by Akta Mahajan | Yummmo",
  description:
    "Ghar pe seekho professional baking — healthy ingredients ke saath. Noida mein limited seats. ₹500 only.",
  openGraph: {
    title: "Live Baking Classes by Akta Mahajan | Yummmo",
    description:
      "Hands-on baking classes in Noida. Small batches, healthy recipes, personal attention. ₹500 only.",
    images: ["/og-live-classes.jpg"],
  },
};

const FOUNDER =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_6884.jpg";
const WORKSHOP_1 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5543.jpg";
const WORKSHOP_2 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5550.jpg";
const WORKSHOP_3 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5714.jpg";
const WORKSHOP_4 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5727.jpg";
const WORKSHOP_5 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5756.jpg";
const CAKE_1 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5737.jpg";
const CAKE_2 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5750.jpg";
const CAKE_3 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5762.jpg";
const CAKE_4 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5775.jpg";
const CAKE_5 =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/IMG_5786.jpg";
const DESIGNER_CAKE =
  "https://wexwculvefhficxhbbby.supabase.co/storage/v1/object/public/media/WhatsApp%20Image%202024-05-01%20at%2001.41.52_4395e100.jpg";

const features = [
  { emoji: "🥣", title: "Healthy Recipes", desc: "Maida-free, sugar-free alternatives" },
  { emoji: "👩‍🍳", title: "Live Demonstration", desc: "Akta ke saath step-by-step seekho" },
  { emoji: "🎂", title: "Hands-on Practice", desc: "Khud banao, ghar le jaao" },
  { emoji: "📖", title: "Recipe Booklet", desc: "Saari recipes written form mein" },
  { emoji: "👥", title: "Small Batches", desc: "Personal attention guaranteed" },
  { emoji: "🏠", title: "Home Setup Tips", desc: "Ghar ki basic equipment se bano" },
];

const faqs = [
  {
    q: "Kya beginners ke liye suitable hai?",
    a: "Bilkul! Koi experience zaruri nahi. Akta aapko zero se sikhati hain — basic oven operation se lekar final plating tak.",
  },
  {
    q: "Class mein kya lana hoga?",
    a: "Kuch nahi! Saare ingredients, equipment aur recipe cards Yummmo provide karega. Aap sirf seekhne ka mann lekar aao.",
  },
  {
    q: "Kya main kuch ghar le ja sakti hoon?",
    a: "Haan zaroor! Jo bhi aap class mein banate hain woh sab aap ghar le jaate hain — packaging ke saath.",
  },
  {
    q: "Registration fee refundable hai?",
    a: "₹500 registration fee non-refundable hai, lekin valid reason pe next batch mein transfer ho sakti hai. Remaining class fee sirf class ke din collect hoti hai.",
  },
  {
    q: "Class ka exact time kya hoga?",
    a: "Registration ke baad WhatsApp pe exact timing confirm ki jaati hai. Generally morning 10 AM se 1 PM ya 11 AM se 2 PM hoti hain.",
  },
  {
    q: "Kitne log hote hain ek class mein?",
    a: "Maximum 5-8 log per batch. Small batches ensure karte hain ki har student ko personal attention mile.",
  },
];

const marqueeItems = [
  "⭐⭐⭐⭐⭐ Amazing experience",
  "🎂 Made my first cake here",
  "💚 Healthy AND delicious",
  "👩‍🍳 Akta is the best teacher",
  "🏠 Took my cake home same day",
  "✨ Worth every rupee",
  "📍 Best thing in Noida",
];

export default async function LiveClassesLandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const autoRegister = sp.auto_register === "1";

  const supabase = await createClient();
  const { data: batches } = await supabase
    .from("live_classes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const activeBatches = (batches ?? []).map((b) => ({
    id: b.id as string,
    title: b.title as string,
    description: b.description as string | null,
    class_date: b.class_date as string | null,
    start_time: b.start_time as string | null,
    end_time: b.end_time as string | null,
    time_slot: b.time_slot as string | null,
    schedule_days: b.schedule_days as string | null,
    location: (b.location as string | null) ?? null,
    location_city: (b.location_city as string | null) ?? null,
    thumbnail_url: (b.thumbnail_url as string | null) ?? null,
    max_spots: b.max_spots as number,
    price: b.price as string | number,
    is_active: b.is_active as boolean,
  }));

  return (
    <div>
      {/* ════════════════ SECTION 1 — HERO ════════════════ */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-cream via-white to-primary/5">
        {/* Animated blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl animate-blob" />
          <div className="absolute -bottom-10 -left-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl animate-blob-delay-2" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          {/* Left — Content */}
          <div className="space-y-6 animate-[fade-up_0.6s_ease-out_forwards]">
            <Badge className="px-4 py-1.5 text-sm">🎂 Limited Seats Per Batch</Badge>

            <h1 className="font-display text-4xl font-bold leading-tight text-charcoal md:text-5xl lg:text-6xl">
              Ghar Pe Banao{" "}
              <span className="text-primary">Professional Cakes.</span>
            </h1>

            <p className="text-lg leading-relaxed text-muted-foreground">
              Akta Mahajan ke saath seekho — healthy ingredients, professional
              techniques, multiple cities mein. Ghar jaao apna khud banaya
              hua cake lekar.
            </p>

            <div className="flex flex-wrap gap-4 text-sm font-medium text-charcoal/80">
              <span className="flex items-center gap-1.5">✓ Hands-on Learning</span>
              <span className="flex items-center gap-1.5">✓ Healthy Ingredients</span>
              <span className="flex items-center gap-1.5">✓ Small Batches Only</span>
            </div>

            <div id="register">
              <LiveClassEnroll
                batches={activeBatches}
                buttonLabel="Register Now — ₹500 →"
                autoRegister={autoRegister}
                triggerProps={{ "data-register-trigger": "" }}
              />
              <p className="mt-2 max-w-md text-xs text-muted-foreground">
                ₹500 registration fee to confirm your spot. Remaining class
                fee payable on the day of the workshop.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              📍 Noida · Haridwar · Laxmi Nagar &nbsp;•&nbsp; ⏰ Multiple Batches
            </p>
          </div>

          {/* Right — Slideshow */}
          <div className="opacity-0 animate-[fade-up_0.6s_ease-out_0.2s_forwards]">
            <HeroSlideshow
              slides={[
                {
                  src: WORKSHOP_2,
                  caption: "Intimate batches of 5-8 students only",
                  tag: "The Classroom",
                },
                {
                  src: WORKSHOP_3,
                  caption: "Personal guidance from Akta herself",
                  tag: "Hands-on Learning",
                },
                {
                  src: WORKSHOP_5,
                  caption: "You decorate. You take it home.",
                  tag: "Real Practice",
                },
                {
                  src: CAKE_4,
                  caption: "6 cakes made in one single session",
                  tag: "Student Results",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 2 — DARK MARQUEE ════════════════ */}
      <div className="overflow-hidden bg-charcoal py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-8 text-sm font-medium text-white/80">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════ SECTION 3 — MEET AKTA ════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          {/* Left — Founder photo */}
          <div className="relative mx-auto w-full max-w-sm md:max-w-full">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={FOUNDER}
                alt="Akta Mahajan, Founder of Yummmo"
                fill
                className="object-cover object-top"
                sizes="(max-width:768px) 100vw, 500px"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-5 pt-16 text-white">
                <p className="font-display text-2xl font-bold">Akta Mahajan</p>
                <p className="text-sm text-white/80">Founder, Yummmo Bakery</p>
              </div>
            </div>
            {/* Floating years badge */}
            <div className="absolute -right-2 top-4 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary text-white shadow-xl">
              <span className="font-display text-2xl font-bold leading-none">10+</span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
                Years
              </span>
            </div>
          </div>

          {/* Right — Bio */}
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Meet Your Chef
            </p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              The Woman Behind Yummmo
            </h2>

            <p className="leading-relaxed text-muted-foreground">
              Akta Mahajan has spent over a decade perfecting the art of
              healthy baking. As the founder of Yummmo — a premium healthy
              bakery featured in Zee News and Economic Times — she has
              redefined what indulgence means for Indian families.
            </p>

            <p className="leading-relaxed text-muted-foreground">
              Ab woh yahi expertise aapke saath share karna chahti hain.
              In-person workshops mein woh sirf recipe nahi — ek complete
              healthy baking philosophy sikhati hain.
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                🏆 Zee News Featured
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                📰 Economic Times
              </span>
              <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                👩‍🍳 100+ Students Trained
              </span>
              <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                🎂 Noida&apos;s #1 Baking Class
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 4 — UPCOMING BATCHES ════════════════ */}
      <section className="py-16" id="batches">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold">Aane Wali Classes</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Har batch mein sirf 5-8 students — personal attention guaranteed
            </p>
            <Badge className="mt-3" variant="herb">Abhi Register Karein</Badge>
          </div>

          {activeBatches.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  Naye batches jaldi aane wale hain — WhatsApp pe updates ke liye{" "}
                  <a
                    href="https://wa.me/918459999991"
                    className="font-medium text-primary underline"
                  >
                    message karein
                  </a>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {activeBatches.map((batch) => {
                const price = typeof batch.price === "string" ? parseFloat(batch.price) : batch.price;
                const timeStr = batch.start_time && batch.end_time
                  ? `${batch.start_time} - ${batch.end_time}`
                  : batch.time_slot;
                return (
                  <Card
                    key={batch.id}
                    className="overflow-hidden border-primary/20 transition hover:shadow-lg"
                  >
                    <CardContent className="p-0">
                      {/* Thumbnail at top */}
                      {batch.thumbnail_url && (
                        <div className="group/poster relative h-44 w-full overflow-hidden">
                          <Image
                            src={batch.thumbnail_url}
                            alt={`${batch.title} poster`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover/poster:scale-105"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                          <a
                            href={batch.thumbnail_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/poster:opacity-100"
                          >
                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-charcoal">
                              🔍 View full poster
                            </span>
                          </a>
                        </div>
                      )}

                      <div className="flex items-center justify-between bg-primary/5 px-6 py-3">
                        <div>
                          {batch.class_date && (
                            <p className="text-sm font-semibold text-charcoal">
                              📅 {formatDate(batch.class_date)}
                            </p>
                          )}
                          {timeStr && (
                            <p className="text-xs text-muted-foreground">🕐 {timeStr}</p>
                          )}
                          {(batch.location_city || batch.location) && (
                            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary">
                              <span>📍</span>
                              <span>{batch.location_city || "Noida"}</span>
                              {batch.location_city && batch.location_city !== "Noida" && (
                                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                  NEW CITY
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge variant="herb" className="shrink-0">
                          Open
                        </Badge>
                      </div>
                      <div className="space-y-3 px-6 py-5">
                        <h3 className="font-display text-xl font-semibold">{batch.title}</h3>
                        {batch.description && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {batch.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          👥 {batch.max_spots} spots available
                        </p>
                        <LiveClassEnroll
                          batches={activeBatches}
                          preSelectedBatchId={batch.id}
                          buttonLabel={`Register — ₹${price > 0 ? price : "Free"}`}
                        />
                        <p className="mt-1 text-center text-xs text-muted-foreground">
                          ₹500 now &middot; Balance on class day
                        </p>
                        <Link
                          href={`/live-classes/${batch.id}`}
                          className="mt-2 block text-center text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-primary"
                        >
                          View full batch details →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════ SECTION 5 — INSIDE THE WORKSHOP ════════════════ */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Real Workshop. Real People.
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              See What Happens Inside
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              Yeh sirf ek class nahi hai — yeh ek experience hai. Students come
              as beginners and leave as bakers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {/* Large image — spans 2 rows on md */}
            <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-2xl shadow-md md:col-span-1">
              <div className="relative aspect-[4/5] md:aspect-auto md:h-full">
                <Image
                  src={WORKSHOP_2}
                  alt="The Classroom"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-display text-lg font-bold">The Classroom</p>
                  <p className="text-xs text-white/80">Warm, hands-on, intimate</p>
                </div>
              </div>
            </div>

            {[
              { src: WORKSHOP_1, label: "Taking notes 📝" },
              { src: WORKSHOP_4, label: "Hands-on practice 🎂" },
              { src: WORKSHOP_5, label: "Cake decorating 🌸" },
              { src: WORKSHOP_3, label: "Personal attention ✨" },
            ].map((item) => (
              <div
                key={item.src}
                className="group relative aspect-square overflow-hidden rounded-2xl shadow-md"
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 6 — STUDENT CREATIONS ════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Student Creations
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Yeh Sab Banaya Hamari Students Ne
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
              First class mein. In their very first workshop. Koi prior
              experience nahi tha.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { src: CAKE_5, name: "Cherry Blossom Cake", label: "First-time baker" },
              { src: CAKE_2, name: "Classic Black Forest", label: "Workshop graduate" },
              { src: CAKE_3, name: "Mother's Day Special", label: "Workshop graduate" },
              { src: CAKE_1, name: "Barbie Princess Cake", label: "Workshop graduate" },
              { src: CAKE_4, name: "6 Cakes in One Day", label: "One batch!" },
              { src: DESIGNER_CAKE, name: "Custom Designer Cake", label: "Advanced workshop" },
            ].map((cake) => (
              <div
                key={cake.name}
                className="group relative aspect-square overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
              >
                <Image
                  src={cake.src}
                  alt={cake.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="font-display text-base font-bold leading-tight">
                    {cake.name}
                  </p>
                  <p className="mt-1 text-xs text-white/90">✓ {cake.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="mb-3 text-muted-foreground">
              Aap bhi yahi banana chahte hain?
            </p>
            <LiveClassEnroll
              batches={activeBatches}
              buttonLabel="Abhi Register Karein — ₹500 →"
            />
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 7 — WHAT YOU'LL LEARN ════════════════ */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">
            Is Class Mein Kya Milega?
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border/60 transition hover:shadow-md">
                <CardContent className="p-5 text-center">
                  <p className="text-3xl">{f.emoji}</p>
                  <h3 className="mt-2 font-display font-semibold">{f.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 8 — HOW IT WORKS ════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">
            Register Karna Kitna Aasaan Hai
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: "📝",
                title: "Register Karein",
                desc: "₹500 registration fee pay karke apni spot confirm karein. Baaki class fee workshop ke din pay karni hogi.",
              },
              {
                number: "02",
                icon: "📲",
                title: "Details Aayengi",
                desc: "Class se 24 ghante pehle exact timing, address aur what to expect ka message aayega.",
              },
              {
                number: "03",
                icon: "🎂",
                title: "Seekho & Banao",
                desc: "3-4 ghante ki hands-on class. Ghar jaao apna banaya hua healthy cake lekar!",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center rounded-2xl border border-border/60 bg-white p-6 text-center shadow-sm"
              >
                <span className="absolute -top-4 left-6 font-display text-5xl font-bold text-primary/10">
                  {step.number}
                </span>
                <span className="mt-4 text-4xl">{step.icon}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-charcoal">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SECTION 9 — LOCATION + CONTACT ════════════════ */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center font-display text-3xl font-bold">
            Kahan Hogi Class?
          </h2>
          <Card className="border-primary/20">
            <CardContent className="space-y-4 p-6 md:p-8">
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="flex items-start gap-2">
                    <span className="shrink-0">📍</span>
                    <span>B2 1602, Cleo County, Sector 121, Noida</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>💬</span>
                    <span>
                      WhatsApp:{" "}
                      <a href="https://wa.me/918459999991" className="text-primary hover:underline">
                        8459999991
                      </a>
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📞</span>
                    <span>
                      Call:{" "}
                      <a href="tel:+918459999991" className="text-primary hover:underline">
                        8459999991
                      </a>
                    </span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="flex items-center gap-2">
                    <span>💰</span>
                    <span className="font-semibold">₹500 per class</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>⏰</span>
                    <span>Duration: 3-4 hours</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <a
                  href="https://wa.me/918459999991?text=Hi%2C%20I%20want%20to%20know%20about%20live%20baking%20classes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-herb bg-herb/10 px-6 py-3 text-sm font-semibold text-herb transition hover:bg-herb/20"
                >
                  💬 WhatsApp Karein
                </a>
                <LiveClassEnroll batches={activeBatches} buttonLabel="Register Now →" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ════════════════ SECTION 10 — FAQ ════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center font-display text-3xl font-bold">
            Kuch Sawaal?
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border/60 bg-white px-4 shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-charcoal hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ════════════════ SECTION 11 — FINAL CTA WITH BG IMAGE ════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={WORKSHOP_3}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-charcoal/80" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center text-white md:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Limited Seats Available
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
            Aaj Hi Book Karein.
            <br />
            <span className="text-primary">Seats Bhar Jaati Hain.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Every batch fills up fast. Don&apos;t miss the chance to bake with
            Akta Mahajan personally — in an intimate, hands-on setting.
          </p>
          <div className="mt-8">
            <LiveClassEnroll
              batches={activeBatches}
              buttonLabel="Register Now — ₹500 Only →"
              buttonClassName="rounded-full bg-primary text-white hover:bg-primary/90 font-bold text-lg px-8 py-6 shadow-2xl shadow-primary/40"
            />
          </div>
          <p className="mt-4 text-xs text-white/60">
            ₹500 to register &middot; Balance on class day &middot; All
            materials provided
          </p>
        </div>
      </section>
    </div>
  );
}
