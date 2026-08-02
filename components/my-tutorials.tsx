import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MyTutorial = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  thumbnail_url: string | null;
  completed: boolean;
};

/**
 * Shown on the homepage directly under the hero, only for signed-in students
 * who have been granted access. One click straight into the video.
 */
export function MyTutorials({
  tutorials,
  firstName,
}: {
  tutorials: MyTutorial[];
  firstName?: string | null;
}) {
  if (tutorials.length === 0) return null;

  return (
    <section className="border-b bg-herb/5">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-charcoal md:text-3xl">
            {firstName ? `Hello, ${firstName}!` : "Your tutorials"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            Your workshop tutorials — watch them right here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((t) => (
            <div
              key={t.id}
              className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <Link
                href={`/learn/${t.slug}`}
                className="relative block aspect-video overflow-hidden bg-muted"
              >
                {t.thumbnail_url ? (
                  <Image
                    src={t.thumbnail_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-herb/20">
                    <PlayCircle className="h-12 w-12 text-primary" />
                  </div>
                )}
                {t.completed && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-herb px-2.5 py-1 text-xs font-semibold text-white">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Completed
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="font-display text-lg font-semibold leading-snug">
                    {t.title}
                  </h3>
                  {t.short_description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {t.short_description}
                    </p>
                  )}
                </div>
                <Button className="mt-auto w-full" size="pill" asChild>
                  <Link href={`/learn/${t.slug}`}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    {t.completed ? "Watch again" : "Watch now"}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
