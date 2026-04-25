import type { Metadata } from "next";
import { ChefHat, Clock, IndianRupee, MapPin, Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveClassEnroll } from "@/components/live-class-enroll";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Live Classes",
  description:
    "Join live healthy cooking classes with hands-on guidance. Weekend and weekday batches available.",
};

const highlights = [
  {
    icon: ChefHat,
    title: "Hands-on Cooking",
    desc: "Cook along with the instructor in real time. Ask questions, get instant feedback.",
  },
  {
    icon: Users,
    title: "Small Batches",
    desc: "Limited seats per class so everyone gets personal attention.",
  },
  {
    icon: Sparkles,
    title: "Healthy Recipes",
    desc: "Learn ingredient swaps that make your favourite dishes healthier — without losing taste.",
  },
  {
    icon: MapPin,
    title: "In-Person Experience",
    desc: "Held at the instructor's home kitchen. A warm, real kitchen experience.",
  },
];

export default async function LiveClassesPage() {
  const supabase = await createClient();
  const { data: batches } = await supabase
    .from("live_classes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const activeBatches = batches ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="mb-16 text-center">
        <Badge className="mb-4">Live Classes</Badge>
        <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
          Learn Healthy Cooking,{" "}
          <span className="text-primary">In Person</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Join our live cooking classes — weekend and weekday batches at the
          instructor&apos;s home kitchen. Small groups, personal attention, and
          recipes you&apos;ll actually use every day.
        </p>
        <div className="mt-8">
          <LiveClassEnroll />
        </div>
      </section>

      {/* ── What you get ───────────────────────────────────────── */}
      <section className="mb-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold">
          What to expect
        </h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <Card key={h.title}>
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <h.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {h.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Upcoming batches (from DB) ─────────────────────────── */}
      <section className="mb-16">
        <h2 className="mb-8 text-center font-display text-2xl font-bold">
          Upcoming Batches
        </h2>

        {activeBatches.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                Abhi koi batch available nahi hai. Jaldi aane wali hain —{" "}
                <a
                  href="https://instagram.com/yummmo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Instagram pe follow karein!
                </a>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {activeBatches.map((batch) => (
              <Card
                key={batch.id}
                className="border-primary/20 bg-gradient-to-br from-white to-primary/5"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {batch.schedule_type}
                    </Badge>
                    {batch.price > 0 ? (
                      <span className="flex items-center gap-0.5 text-sm font-semibold text-primary">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {batch.price}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-herb border-herb/30">
                        Free
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-display text-xl font-semibold">
                    {batch.title}
                  </h3>

                  {batch.description && (
                    <p className="text-sm text-muted-foreground">
                      {batch.description}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-muted-foreground">
                    {batch.schedule_days && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        {batch.schedule_days}
                        {batch.time_slot ? ` · ${batch.time_slot}` : ""}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      {batch.max_spots} spots per batch
                    </p>
                  </div>

                  <LiveClassEnroll liveClassId={batch.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-primary/10 via-cream to-herb/10 p-8 text-center md:p-12">
        <h2 className="font-display text-3xl font-bold">
          Ready to cook healthy?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Pick a date, choose your slot, and join the next batch. No prior
          experience needed — just bring your curiosity and appetite!
        </p>
        <div className="mt-6">
          <LiveClassEnroll buttonLabel="Register Your Spot" />
        </div>
      </section>
    </div>
  );
}
