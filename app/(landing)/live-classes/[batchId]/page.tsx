import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LiveClassEnroll } from "@/components/live-class-enroll";
import { WhatsAppShare } from "@/components/whatsapp-share";

type Props = { params: Promise<{ batchId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { batchId } = await params;
  const supabase = await createClient();
  const { data: batch } = await supabase
    .from("live_classes")
    .select("title, description, thumbnail_url")
    .eq("id", batchId)
    .maybeSingle();
  if (!batch) return { title: "Batch" };
  return {
    title: `${batch.title} | Yummmo Live Class`,
    description: batch.description ?? undefined,
    openGraph: batch.thumbnail_url
      ? { images: [{ url: batch.thumbnail_url as string }] }
      : undefined,
  };
}

type Batch = {
  id: string;
  title: string;
  description: string | null;
  class_date: string | null;
  start_time: string | null;
  end_time: string | null;
  time_slot: string | null;
  schedule_days: string | null;
  location: string | null;
  location_city: string | null;
  thumbnail_url: string | null;
  max_spots: number;
  price: string | number;
  is_active: boolean;
};

export default async function BatchPage({ params }: Props) {
  const { batchId } = await params;
  const supabase = await createClient();

  const { data: batchRaw } = await supabase
    .from("live_classes")
    .select("*")
    .eq("id", batchId)
    .eq("is_active", true)
    .maybeSingle();

  if (!batchRaw) notFound();

  const batch = batchRaw as unknown as Batch;

  const dateStr = batch.class_date
    ? new Date(batch.class_date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // Count current registrations to compute spots left
  const { count: registeredCount } = await supabase
    .from("live_class_registrations")
    .select("id", { count: "exact", head: true })
    .eq("live_class_id", batch.id);

  const spotsLeft =
    batch.max_spots != null
      ? Math.max(0, batch.max_spots - (registeredCount ?? 0))
      : null;

  const city = batch.location_city || "Noida";

  return (
    <div className="min-h-screen bg-cream">
      {/* Batch Poster */}
      {batch.thumbnail_url && (
        <div className="relative w-full bg-charcoal">
          <div className="group relative mx-auto max-w-2xl">
            <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[4/3]">
              <Image
                src={batch.thumbnail_url}
                alt={batch.title}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                priority
                sizes="(max-width: 672px) 100vw, 672px"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-charcoal backdrop-blur-sm">
                🔍 Click below to view full poster
              </span>
            </div>
          </div>

          <div className="py-2 text-center">
            <a
              href={batch.thumbnail_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/60 underline hover:text-white/90"
            >
              View full poster ↗
            </a>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/live-classes"
            className="mb-4 flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← All Classes
          </Link>

          {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 3 && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              🔥 Only {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left!
            </div>
          )}

          <h1 className="font-display text-3xl font-bold text-charcoal md:text-4xl">
            {batch.title}
          </h1>

          {batch.description && (
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {batch.description}
            </p>
          )}
        </div>

        {/* Key Details Card */}
        <div className="mb-8 space-y-4 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Class Details</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dateStr && (
              <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-semibold text-charcoal">
                    {dateStr}
                  </p>
                </div>
              </div>
            )}

            {(batch.start_time || batch.time_slot) && (
              <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
                <span className="text-xl">⏰</span>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-semibold text-charcoal">
                    {batch.start_time && batch.end_time
                      ? `${batch.start_time} – ${batch.end_time}`
                      : batch.time_slot}
                  </p>
                </div>
              </div>
            )}

            {(batch.location || batch.location_city) && (
              <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold text-charcoal">{city}</p>
                  {batch.location && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {batch.location}
                    </p>
                  )}
                </div>
              </div>
            )}

            {batch.max_spots != null && (
              <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-3">
                <span className="text-xl">👥</span>
                <div>
                  <p className="text-xs text-muted-foreground">Batch Size</p>
                  <p className="text-sm font-semibold text-charcoal">
                    {spotsLeft !== null
                      ? `${spotsLeft} of ${batch.max_spots} spots left`
                      : `Max ${batch.max_spots} students`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <span className="text-xl">💰</span>
              <div>
                <p className="text-xs text-muted-foreground">Fee</p>
                <p className="text-sm font-bold text-primary">
                  ₹500 to register
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Balance payable on class day
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-xs text-muted-foreground">
                  What&apos;s included
                </p>
                <p className="text-sm font-semibold text-charcoal">
                  All materials provided
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Take your creation home
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor */}
        <div className="mb-8 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-xl font-bold text-primary">
              A
            </div>
            <div>
              <p className="font-bold text-charcoal">Akta Mahajan</p>
              <p className="text-sm text-muted-foreground">
                Founder, Yummmo · 10+ Years Experience
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Featured in Zee News &amp; Economic Times
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="font-display text-xl font-bold text-charcoal">
            Ready to Join?
          </p>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Sirf ₹500 mein apni spot confirm karein
          </p>
          <LiveClassEnroll
            batches={[batch]}
            preSelectedBatchId={batch.id}
            buttonLabel="Register for This Batch — ₹500 →"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            ₹500 registration · Balance on class day · All materials included
          </p>
        </div>

        {/* Share */}
        <div className="mt-6 text-center">
          <p className="mb-2 text-xs text-muted-foreground">Share this class</p>
          <div className="flex justify-center gap-3">
            <WhatsAppShare title={batch.title} dateStr={dateStr} city={city} />
          </div>
        </div>
      </div>
    </div>
  );
}
