import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const blogPosts: Record<
  string,
  {
    title: string;
    date: string;
    author: string;
    readTime: string;
    emoji: string;
    gradient: string;
    content: string;
  }
> = {
  "atta-cake-recipes": {
    title: "5 Whole Wheat Cake Recipes That Actually Taste Amazing",
    date: "15 April 2026",
    author: "Akta Mahajan",
    readTime: "5 min read",
    emoji: "🎂",
    gradient: "from-amber-400 to-orange-500",
    content: `## Refined Flour to Whole Wheat — Does It Really Make a Difference?

Many people think a whole wheat cake can never be as soft as a refined flour cake. That is a myth, and we are going to clear it up today. With the right technique and the right ratio, a whole wheat cake is not only healthier — it is usually more moist and more flavourful too.

## Recipe 1: Classic Vanilla Whole Wheat Cake

**Ingredients:**
- 1.5 cups whole wheat flour (finely milled)
- 3/4 cup jaggery powder
- 1/2 cup curd
- 1/2 cup oil
- 1 tsp vanilla extract
- 1.5 tsp baking powder
- 1/2 tsp baking soda

**Method:** Whisk the curd and jaggery powder together until light and smooth. Add the oil and vanilla. Fold in the dry ingredients. Bake at 180 degree C for 35-40 minutes.

**Tip:** This cake is completely eggless. The curd keeps it extra moist and it also reacts with the baking soda to give a lovely rise — this is the secret professional bakers use.

## Recipe 2: Chocolate Whole Wheat Cake

Are you a chocolate lover? This recipe uses cocoa powder, and all the sweetness comes from dates paste instead of refined sugar.

**Key swap:** 1/4 cup cocoa powder + 1/2 cup dates paste (instead of sugar)

The result? A dark, fudgy, guilt-free chocolate cake.

## Recipe 3: Banana Oat Whole Wheat Cake

A breakfast cake that children actually ask for! Two ripe bananas bring in all the sweetness, so you do not need to add any sugar at all.

**Zero added sugar** — the natural sweetness of the bananas is enough.

## Recipe 4: Almond and Cardamom Whole Wheat Cake

This recipe is perfect when you want Indian flavours. The aroma of cardamom with the crunch of almonds — ideal for festival days.

**Festive touch:** Scatter sliced almonds on top before baking — they turn golden and crunchy.

## Recipe 5: Mango Whole Wheat Cake (Summer Special)

When mango season arrives, you must try this cake. Fresh mango pulp sweetens the cake and keeps it moist at the same time.

**Tip:** Alphonso mango pulp gives the best result — sweeter and more aromatic.

## Common Mistakes and Solutions

**Problem:** The cake came out dense
**Solution:** Do not over-mix. Mix only until everything has just come together.

**Problem:** Burnt on top, raw inside
**Solution:** Keep the temperature at 170 degree C and use the middle rack of the oven.

**Problem:** The cake feels sticky
**Solution:** Let it cool in the pan for 10 minutes before you take it out.`,
  },
  "sugar-free-mithai": {
    title: "Sugar-Free Indian Sweets for Every Festival",
    date: "10 April 2026",
    author: "Akta Mahajan",
    readTime: "6 min read",
    emoji: "🪔",
    gradient: "from-purple-400 to-pink-500",
    content: `## Festival Sweetness — Without Sugar?

Yes, it is possible! With jaggery, dates, honey and coconut sugar you can get that same festival sweetness — without the blood sugar spike. This is exactly what we teach at Yummmo.

## Why Refined Sugar is a Problem

Refined sugar pushes your blood glucose up almost instantly. Eating sweets every single day through the festival season is a warning bell for anyone with diabetes, and even for everyone else it leads to weight gain and energy crashes.

**Better alternatives:**
- Jaggery — iron rich, slow release energy
- Dates paste — fibre + natural sweetness
- Coconut sugar — low glycemic index
- Honey — antibacterial, perfect in small quantities

## Diwali Special: Jaggery Gram Flour Ladoo

The classic recipe with one swap — jaggery powder in place of sugar.

**Ingredients:**
- 2 cups gram flour
- 3/4 cup jaggery powder (finely grated)
- 1/2 cup ghee
- Cardamom, dry fruits

**Method:** Roast the gram flour in ghee on a slow flame until it turns golden brown (15-20 min). Let it cool. Mix in the jaggery. Shape into ladoos.

**Why it works:** The light caramel flavour of jaggery goes beautifully with roasted gram flour.

## Holi Special: Thandai Barfi (Dates Sweetened)

Traditional thandai flavours — rose, saffron and almond — in a barfi shape. Sweetened with dates paste, so no sugar is needed.

## Raksha Bandhan: Coconut Ladoo with Stevia

An ultra-simple 3-ingredient recipe. Desiccated coconut, a condensed milk substitute (made with full fat milk + stevia), and cardamom. Ready in 20 minutes, with no cooking needed.

## Tips for Perfect Sugar-Free Sweets

- Jaggery holds moisture — grate it finely, or the sweets will not stay soft
- Dates paste — soak seedless dates in warm water for 30 min, then blend them
- Do not add too much honey — 1-2 tbsp is usually enough
- Storage — they stay fresh for 5-7 days in an airtight container

## Advice from Akta

You do not have to give up sweets completely during the festival season. Just make smarter choices. Eat one jaggery ladoo and enjoy it — no guilt, only taste.`,
  },
  "healthy-oil-swaps": {
    title: "The Complete Guide to Healthy Oil Swaps",
    date: "5 April 2026",
    author: "Akta Mahajan",
    readTime: "7 min read",
    emoji: "🫒",
    gradient: "from-green-400 to-teal-500",
    content: `## Choosing the Right Oil — How Much Does It Matter?

Oil plays a central role in Indian cooking. Whether you are making a tempering, baking a cake or frying something — the oil you choose affects both flavour and health.

## Why Smoke Point Matters

When oil is heated past its smoke point, it starts to release harmful compounds. So for high heat cooking you need an oil with a high smoke point.

**Quick guide:**
- Mustard Oil (250 degree C) — Tempering, deep frying
- Coconut Oil (177 degree C) — Medium heat, baking
- Olive Oil Extra Virgin (190 degree C) — Salads, low heat
- Ghee (252 degree C) — High heat, roti
- Sesame Oil refined (232 degree C) — Stir fry

## Mustard Oil — The Indian Classic

Mustard oil is the backbone of Indian cooking. A high smoke point and a strong, distinctive flavour — essential for Bengali and Punjabi food.

**Best for:** Deep frying, pickles, Bengali cuisine, Punjabi dishes

## Coconut Oil for Baking

Using coconut oil in place of butter or refined oil is an excellent swap for baking. Its medium chain fatty acids are metabolised quickly, and the light coconut flavour adds a nice depth to cakes.

**Tip:** Virgin coconut oil has stronger flavour. Refined coconut oil is more neutral — better for Indian sweet dishes.

## Olive Oil — When to Use It, When Not To

Many people now use olive oil for everything — and that is a mistake!

**Use it for:** Salad dressings, pasta, roasted vegetables, low-heat sauteing
**Avoid it for:** Deep frying and high-heat Indian tempering — the smoke point is too low

## Ghee — Our Superfood

Pure ghee is having a global moment — and rightly so. High smoke point, incredible flavour, and when made from grass-fed cows, loaded with CLA and fat-soluble vitamins.

**Akta's rule:** 1 tsp ghee on your dal or roti — that is one thing you should never give up.

## Practical Swaps for Your Kitchen

- Vegetable dishes — Mustard oil or refined sunflower (high heat)
- Roti and paratha — Ghee (small amount)
- Baking — Coconut oil or neutral oils
- Salad dressing — Extra virgin olive oil
- Tempering — Ghee or mustard oil`,
  },
  "kids-eat-healthy": {
    title: "How to Get Kids to Eat Healthy (Without Them Knowing)",
    date: "28 March 2026",
    author: "Akta Mahajan",
    readTime: "6 min read",
    emoji: "🥗",
    gradient: "from-yellow-400 to-green-500",
    content: `## The Biggest Challenge for Mothers

"My child does not eat vegetables" — almost every second Indian mother says this. But what if you could hide the vegetables so cleverly that your child never finds out?

This is not sneaky parenting — this is smart cooking!

## The Golden Rule: Texture and Color

Children reject vegetables for mainly two reasons: a texture they do not like, and anything green, which instantly looks suspicious to them.

**Solution:** Puree it, blend it, or turn it into a texture they already know and enjoy.

## Trick 1: Spinach in Chocolate Smoothie

Spinach and chocolate? It sounds strange, but it tastes amazing!

- 1 cup milk
- 1 handful spinach
- 1 frozen banana
- 1 tbsp cocoa powder
- 2-3 dates (sweetener)

Once you blend it, the cocoa turns the green colour into a purple-brown. The taste? Pure chocolate. The nutrition? Hidden spinach!

## Trick 2: Cauliflower in Mac & Cheese

Boil the cauliflower, mash it well, and mix it into the cheese sauce. The volume goes up, the calories come down, and the taste stays the same.

**Tip:** Start with a 50/50 ratio — 50% cauliflower, 50% actual pasta. Then slowly increase the cauliflower.

## Trick 3: Ragi in Cookies

The dark colour of ragi (finger millet) hides perfectly behind the chocolate chips!

- 1 cup ragi flour + 1/2 cup whole wheat flour
- 1/2 cup jaggery powder
- 1/4 cup ghee/butter
- 1 egg
- 1/2 cup dark chocolate chips

**Result:** Crunchy, chocolatey cookies with hidden superfood nutrition.

## Trick 4: Lentils in Pasta Sauce

Boil red lentils or yellow lentils until soft and blend them completely smooth. Mix the puree into your tomato pasta sauce. The protein doubles, and the children never know.

**Tip:** Red lentils blend perfectly smooth and they do not change the colour of the sauce either.

## Trick 5: Zucchini in Paratha

Grate the zucchini (bottle gourd works just as well), squeeze out the extra water, and mix it into the dough. Soft parathas — and children surprisingly love them!

## Start with These 3 Today

- Spinach in chocolate smoothie
- Ragi in any cookie or biscuit recipe
- Grated zucchini in paratha dough

Three small changes — three easy wins. Start tomorrow!`,
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug];
  if (!post) return {};
  return {
    title: `${post.title} | Yummmo Learn Blog`,
    description: post.content
      .slice(0, 160)
      .replace(/[#*\n]/g, " ")
      .trim(),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts[slug];
  if (!post) notFound();

  const lines = post.content.split("\n").filter((l) => l.trim() !== "");

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${post.gradient} py-20`}>
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <p className="mb-4 text-6xl">{post.emoji}</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-white/90">
            <span>By {post.author}</span>
            <span>&middot;</span>
            <span>{post.date}</span>
            <span>&middot;</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <article className="space-y-4">
          {lines.map((line, i) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="mt-8 font-display text-2xl font-bold text-charcoal"
                >
                  {trimmed.replace("## ", "")}
                </h2>
              );
            }
            if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
              return (
                <p key={i} className="font-semibold text-charcoal">
                  {trimmed.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (trimmed.startsWith("- ")) {
              return (
                <li
                  key={i}
                  className="ml-4 list-disc text-muted-foreground"
                >
                  {trimmed.replace("- ", "")}
                </li>
              );
            }
            // Handle inline bold
            const parts = trimmed.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={i} className="leading-relaxed text-muted-foreground">
                {parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j} className="text-charcoal">
                      {part.replace(/\*\*/g, "")}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </p>
            );
          })}
        </article>

        {/* CTAs */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/10 p-8 text-center">
          <p className="font-display text-xl font-bold text-charcoal">
            Want to learn more about this?
          </p>
          <p className="mt-2 text-muted-foreground">
            Learn with Akta Mahajan — at a live workshop or through the
            recorded lessons
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="pill">
              <Link href="/courses">See Free Courses &rarr;</Link>
            </Button>
            <Button asChild variant="outline" size="pill">
              <Link href="/live-classes">See Live Workshops</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
