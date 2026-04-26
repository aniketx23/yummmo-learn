import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Healthy cooking tips, ingredient swap guides, and recipes from the Yummmo Learn kitchen.",
};

const posts = [
  {
    slug: "atta-cake-recipes",
    title: "5 Atta Cake Recipes That Actually Taste Amazing",
    excerpt:
      "Think whole wheat cakes are dry and bland? These recipes will change your mind.",
    date: "15/04/2026",
    readTime: "5 min",
    emoji: "🎂",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    slug: "sugar-free-mithai",
    title: "Sugar-Free Mithai for Every Festival",
    excerpt:
      "Diwali, Holi, Rakhi — make sweets your family will love without refined sugar.",
    date: "10/04/2026",
    readTime: "6 min",
    emoji: "🪔",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    slug: "healthy-oil-swaps",
    title: "The Complete Guide to Healthy Oil Swaps",
    excerpt:
      "Mustard oil vs coconut oil vs olive oil — which one to use when.",
    date: "05/04/2026",
    readTime: "7 min",
    emoji: "🫒",
    gradient: "from-green-400 to-teal-500",
  },
  {
    slug: "kids-eat-healthy",
    title: "How to Get Kids to Eat Healthy (Without Them Knowing)",
    excerpt:
      "Sneak spinach into smoothies, cauliflower into pasta, ragi into cookies.",
    date: "28/03/2026",
    readTime: "6 min",
    emoji: "🥗",
    gradient: "from-yellow-400 to-green-500",
  },
];

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      {/* ── Newsletter signup ──────────────────────────────────── */}
      <section className="mb-16 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-amber-500 p-8 text-center text-white">
        <h1 className="font-display text-3xl font-bold">
          Healthy Cooking Tips &amp; Recipes
        </h1>
        <p className="mt-2 text-white/90">
          Get weekly tips on ingredient swaps, new recipes, and course updates
          — straight to your inbox.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <NewsletterForm />
        </div>
        <p className="mt-3 text-xs text-white/70">
          No spam, unsubscribe anytime.
        </p>
      </section>

      {/* ── Blog posts ─────────────────────────────────────────── */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl font-bold">Latest Articles</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex h-40 items-center justify-center bg-gradient-to-br ${post.gradient}`}
              >
                <span className="text-6xl">{post.emoji}</span>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.date}</span>
                  <span>&middot;</span>
                  <span>{post.readTime} read</span>
                </div>
                <h3 className="line-clamp-2 font-display font-bold text-charcoal transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">
                  Read more &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
