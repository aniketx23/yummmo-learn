import type { Metadata } from "next";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LiveClassEnroll } from "@/components/live-class-enroll";
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
    a: "Ek baar registration ke baad class miss hone pe next available batch mein adjust kar sakte hain. Direct refund available nahi hai.",
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
    max_spots: b.max_spots as number,
    price: b.price as string | number,
    is_active: b.is_active as boolean,
  }));

  return (
    <div>
      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO
          ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-cream via-white to-primary/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center animate-[fade-up_0.6s_ease-out_forwards] md:py-24">
          <Badge className="text-sm px-4 py-1.5">🎂 Limited Seats Per Batch</Badge>

          <h1 className="font-display text-4xl font-bold leading-tight text-charcoal md:text-6xl">
            Ghar Pe Banao{" "}
            <span className="text-primary">Professional Cakes</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Akta Mahajan ke saath seekho — step by step, bilkul aasaan tarike se
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-charcoal/80">
            <span className="flex items-center gap-1.5">✓ Hands-on Learning</span>
            <span className="flex items-center gap-1.5">✓ Healthy Ingredients</span>
            <span className="flex items-center gap-1.5">✓ Small Batches Only</span>
          </div>

          <div id="register">
            <LiveClassEnroll
              batches={activeBatches}
              buttonLabel="Register Now — ₹500 Only →"
              autoRegister={autoRegister}
              triggerProps={{ "data-register-trigger": "" }}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            📍 Noida · 🕐 Weekend & Weekday Batches Available
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — MEET AKTA
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-cream shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80"
              alt="Akta Mahajan"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 400px"
            />
          </div>
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Meet Your Chef
            </p>
            <h2 className="font-display text-3xl font-bold">Akta Mahajan</h2>
            <p className="text-sm font-medium text-muted-foreground">
              Founder, Yummmo Bakery · Master Baker
            </p>
            <p className="text-muted-foreground leading-relaxed">
              10+ saalon ki baking expertise. Healthy ingredients mein specialist
              — maida ki jagah atta, chini ki jagah jaggery. Aapko wahi
              sikhaungi jo maine khud saalon mein seekha.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                🏆 Featured on Zee News
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                📰 Economic Times
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                🎓 100+ Students Trained
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — UPCOMING BATCHES
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16" id="batches">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold">Aane Wali Classes</h2>
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
                        </div>
                        <Badge variant="herb" className="shrink-0">
                          Open
                        </Badge>
                      </div>
                      <div className="space-y-3 px-6 py-5">
                        <h3 className="font-display text-xl font-semibold">{batch.title}</h3>
                        {batch.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
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
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — WHAT YOU'LL LEARN
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16">
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

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — PRODUCT GALLERY
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold">Yummmo Ki Creations</h2>
            <p className="mt-2 text-muted-foreground">
              Yehi sikhate hain hum — healthy bhi, beautiful bhi
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              { label: "Atta Chocolate Cake", emoji: "🍫", gradient: "from-amber-600 to-orange-700" },
              { label: "Ragi Banana Bread", emoji: "🍌", gradient: "from-yellow-500 to-amber-600" },
              { label: "Jaggery Cookies", emoji: "🍪", gradient: "from-orange-400 to-red-500" },
              { label: "Healthy Red Velvet", emoji: "❤️", gradient: "from-red-500 to-pink-600" },
              { label: "Oats Muffins", emoji: "🧁", gradient: "from-teal-400 to-green-500" },
              { label: "Date Walnut Cake", emoji: "🌰", gradient: "from-amber-700 to-yellow-800" },
            ].map((item) => (
              <div
                key={item.label}
                className={`relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} text-white transition-transform duration-300 hover:scale-105`}
              >
                <span className="text-5xl">{item.emoji}</span>
                <p className="mt-3 px-2 text-center text-sm font-semibold text-white/90">
                  {item.label}
                </p>
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
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
                desc: "₹500 pay karke apni spot confirm karein. WhatsApp confirmation milega.",
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

      {/* ══════════════════════════════════════════════════════════
          SECTION 7 — LOCATION + CONTACT
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16">
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

      {/* ══════════════════════════════════════════════════════════
          SECTION 8 — FAQ
          ══════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════
          SECTION 9 — FINAL CTA
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Aaj Hi Book Karein — Seats Limited Hain!
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            ₹500 mein professional baking seekho — Akta Mahajan ke saath
          </p>
          <div className="mt-8">
            <LiveClassEnroll
              batches={activeBatches}
              buttonLabel="Abhi Register Karein →"
              buttonClassName="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 font-bold"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
