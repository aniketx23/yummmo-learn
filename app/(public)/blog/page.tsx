import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterForm } from "@/components/newsletter-form";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Healthy cooking tips, ingredient swap guides, and recipes from the Yummmo Learn kitchen.",
};

const posts = [
  {
    title: "5 Atta Cake Recipes That Actually Taste Amazing",
    slug: "atta-cake-recipes",
    excerpt:
      "Think whole wheat cakes are dry and bland? These recipes will change your mind. From chocolate to mango, each one is moist, fluffy, and guilt-free.",
    date: "2026-04-15",
  },
  {
    title: "Sugar-Free Mithai for Every Festival",
    slug: "sugar-free-mithai",
    excerpt:
      "Diwali, Holi, Rakhi — make sweets your family will love without refined sugar. We use dates, jaggery, and stevia-based swaps.",
    date: "2026-04-10",
  },
  {
    title: "The Complete Guide to Healthy Oil Swaps",
    slug: "healthy-oil-swaps",
    excerpt:
      "Mustard oil vs coconut oil vs olive oil — which one to use for tadka, baking, and frying? A practical guide for Indian kitchens.",
    date: "2026-04-05",
  },
  {
    title: "How to Get Kids to Eat Healthy (Without Them Knowing)",
    slug: "kids-eat-healthy",
    excerpt:
      "Sneak spinach into parathas, cauliflower into pasta sauce, and ragi into cookies. Tested by moms, approved by kids.",
    date: "2026-03-28",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* ── Newsletter signup ──────────────────────────────────── */}
      <section className="mb-16 rounded-2xl bg-gradient-to-br from-primary/10 via-cream to-herb/10 p-8 text-center">
        <h1 className="font-display text-3xl font-bold">
          Healthy Cooking Tips & Recipes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Get weekly tips on ingredient swaps, new recipes, and course updates
          — straight to your inbox.
        </p>
        <NewsletterForm />
        <p className="mt-2 text-xs text-muted-foreground">
          No spam, unsubscribe anytime.
        </p>
      </section>

      {/* ── Blog posts ─────────────────────────────────────────── */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl font-bold">Latest Articles</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(post.date)}
                  </p>
                  <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="flex-1 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
