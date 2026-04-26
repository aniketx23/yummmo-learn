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
    title: "5 Atta Cake Recipes That Actually Taste Amazing",
    date: "15 April 2026",
    author: "Akta Mahajan",
    readTime: "5 min read",
    emoji: "🎂",
    gradient: "from-amber-400 to-orange-500",
    content: `## Maida se Atta — Kya Sach Mein Fark Padta Hai?

Bahut log sochte hain ki atta cake maida cake jaisa soft nahi hoga. Yeh ek myth hai jo hum aaj todenge. Sahi technique aur sahi ratio ke saath, atta cake na sirf healthy hota hai — balki zyada moist aur flavourful bhi hota hai.

## Recipe 1: Classic Vanilla Atta Cake

**Ingredients:**
- 1.5 cups whole wheat atta (finely milled)
- 3/4 cup jaggery powder
- 2 eggs (room temperature)
- 1/2 cup curd
- 1/2 cup oil
- 1 tsp vanilla extract
- 1.5 tsp baking powder
- 1/2 tsp baking soda

**Method:** Eggs aur jaggery ko fluffy hone tak beat karo. Curd, oil, vanilla add karo. Dry ingredients fold karo. 180 degree C pe 35-40 minutes bake karo.

**Tip:** Curd daalne se cake extra moist banta hai — yeh professional bakers ka secret hai.

## Recipe 2: Chocolate Atta Cake

Chocolate lover hain? Is recipe mein cocoa powder use karte hain — refined sugar nahi, dates paste se mithaas laate hain.

**Key swap:** 1/4 cup cocoa powder + 1/2 cup dates paste (instead of sugar)

Result? Dark, fudgy, guilt-free chocolate cake.

## Recipe 3: Banana Oat Atta Cake

Breakfast cake jo bacche bhi prefer karein! 2 ripe bananas naturally sweetness dete hain — alag se sugar ki zaroorat hi nahi.

**Zero added sugar** — bananas ki natural sweetness enough hai.

## Recipe 4: Almond & Cardamom Atta Cake

Indian flavours ke liye yeh recipe perfect hai. Elaichi ki khushboo aur almonds ka crunch — festive occasions ke liye ideal.

**Festive touch:** Top pe sliced almonds scatter karo before baking — golden aur crunchy ho jaate hain.

## Recipe 5: Mango Atta Cake (Summer Special)

Aam ka season aaye toh yeh cake zaroor try karo. Fresh mango pulp naturally sweeten aur moisturize karta hai cake ko.

**Tip:** Alphonso mangoes ka pulp sabse best result deta hai — zyada sweet aur aromatic.

## Common Mistakes Aur Solutions

**Problem:** Cake dense nikla
**Solution:** Over-mixing se bachao — sirf tab tak mix karo jab tak sab combine ho jaaye.

**Problem:** Top jal gaya andar se kacha
**Solution:** Temperature 170 degree C pe rakho, oven ka middle rack use karo.

**Problem:** Cake sticky lag raha hai
**Solution:** 10 minutes pan mein cool karo pehle nikaalane se.`,
  },
  "sugar-free-mithai": {
    title: "Sugar-Free Mithai for Every Festival",
    date: "10 April 2026",
    author: "Akta Mahajan",
    readTime: "6 min read",
    emoji: "🪔",
    gradient: "from-purple-400 to-pink-500",
    content: `## Tyohaar Mein Mithas — Bina Chini Ke?

Haan, yeh possible hai! Jaggery, dates, honey aur coconut sugar se aap wahi tyohaar wali sweetness la sakte hain — bina blood sugar spike ke. Yummmo mein hum yahi sikhate hain.

## Why Refined Sugar is a Problem

Refined sugar instantly blood glucose spike karta hai. Festival season mein roz mithai khana — diabetic patients ke liye toh khatre ki ghanti hai, lekin normal logon ke liye bhi weight gain aur energy crashes cause karta hai.

**Better alternatives:**
- Jaggery — iron rich, slow release energy
- Dates paste — fibre + natural sweetness
- Coconut sugar — low glycemic index
- Honey — antibacterial, small quantities mein perfect

## Diwali Special: Jaggery Besan Ladoo

Classic recipe with one swap — chini ki jagah jaggery powder.

**Ingredients:**
- 2 cups besan
- 3/4 cup jaggery powder (finely grated)
- 1/2 cup ghee
- Cardamom, dry fruits

**Method:** Besan ko ghee mein slow flame pe roast karo jab tak golden brown na ho jaaye (15-20 min). Thanda karo. Jaggery mix karo. Ladoo banao.

**Why it works:** Jaggery ka slight caramel flavour besan ke saath amazingly complement karta hai.

## Holi Special: Thandai Barfi (Dates Sweetened)

Traditional thandai flavours — rose, kesar, badam — in a barfi format. Dates paste se sweetened, no sugar needed.

## Raksha Bandhan: Coconut Ladoo with Stevia

Ultra-simple 3-ingredient recipe. Desiccated coconut, condensed milk substitute (made with full fat milk + stevia), and cardamom. Ready in 20 minutes, no cooking needed.

## Tips for Perfect Sugar-Free Mithai

- Jaggery me moisture — finely grate karo, warna mithai soft nahi hogi
- Dates paste — seedless dates ko warm water mein soak karo 30 min, phir blend karo
- Honey zyada mat daalo — 1-2 tbsp usually enough hai
- Storage — airtight container mein 5-7 din tak fresh rehti hain

## Akta Ka Advice

Festival season mein mithai completely skip karna zaruri nahi. Sirf smarter choices karo. Ek jaggery ladoo khao aur enjoy karo — guilt nahi, sirf swad!`,
  },
  "healthy-oil-swaps": {
    title: "The Complete Guide to Healthy Oil Swaps",
    date: "5 April 2026",
    author: "Akta Mahajan",
    readTime: "7 min read",
    emoji: "🫒",
    gradient: "from-green-400 to-teal-500",
    content: `## Sahi Tel Ka Chunav — Kitna Important Hai?

Indian cooking mein oil ek central role play karta hai. Tadka ho, baking ho ya frying — sahi oil choose karna flavour aur health dono affect karta hai.

## Smoke Point Kyon Matter Karta Hai

Jab oil apne smoke point se upar garam hota hai, toh harmful compounds release hote hain. High heat cooking ke liye high smoke point oil zaruri hai.

**Quick guide:**
- Mustard Oil (250 degree C) — Tadka, deep fry
- Coconut Oil (177 degree C) — Medium heat, baking
- Olive Oil Extra Virgin (190 degree C) — Salads, low heat
- Ghee (252 degree C) — High heat, roti
- Sesame Oil refined (232 degree C) — Stir fry

## Mustard Oil — The Indian Classic

Sarson ka tel Indian cooking ka backbone hai. High smoke point aur distinctive flavour — Bengali aur Punjabi cuisine ke liye essential.

**Best for:** Deep frying, pickles, Bengali cuisine, Punjabi dishes

## Coconut Oil for Baking

Baking mein butter ya refined oil ki jagah coconut oil use karna excellent swap hai. Medium chain fatty acids quickly metabolized hote hain. Slight coconut flavour depth add karta hai cakes mein.

**Tip:** Virgin coconut oil has stronger flavour. Refined coconut oil is more neutral — better for Indian sweet dishes.

## Olive Oil — Kab Use Karein, Kab Nahi

Bahut log har cheez mein olive oil use karte hain — yeh galti hai!

**Use karo:** Salad dressings, pasta, roasted vegetables, low-heat sauteing
**Avoid:** Deep frying, high-heat Indian tadka — smoke point low hai

## Ghee — Our Superfood

Pure desi ghee is having a global moment — and rightly so. High smoke point, incredible flavour, and when made from grass-fed cows, loaded with CLA and fat-soluble vitamins.

**Akta's rule:** 1 tsp ghee pe dal ya roti — yeh nahi chhodni chahiye.

## Practical Swaps for Your Kitchen

- Sabzi mein — Mustard oil ya refined sunflower (high heat)
- Roti/paratha — Ghee (small amount)
- Baking — Coconut oil ya neutral oils
- Salad dressing — Extra virgin olive oil
- Tadka — Ghee ya mustard oil`,
  },
  "kids-eat-healthy": {
    title: "How to Get Kids to Eat Healthy (Without Them Knowing)",
    date: "28 March 2026",
    author: "Akta Mahajan",
    readTime: "6 min read",
    emoji: "🥗",
    gradient: "from-yellow-400 to-green-500",
    content: `## Moms Ka Sabse Bada Challenge

"Mera bachha vegetables nahi khaata" — yeh sentence har doosri Indian mom kehti hai. Lekin kya hoga agar vegetables itne cleverly hide karein ki bachhe ko pata hi na chale?

Yeh sneaky parenting nahi hai — yeh smart cooking hai!

## The Golden Rule: Texture and Color

Bacche mainly do wajahon se vegetables reject karte hain: texture jo unhe pasand nahi, aur green cheezein jo suspicious lagti hain.

**Solution:** Puree karo, blend karo, ya familiar textures mein transform karo.

## Trick 1: Spinach in Chocolate Smoothie

Palak aur chocolate? Sounds weird, tastes amazing!

- 1 cup milk
- 1 handful spinach
- 1 frozen banana
- 1 tbsp cocoa powder
- 2-3 dates (sweetener)

Blend karenge toh green colour purple-brown ho jaata hai cocoa se. Taste? Pure chocolate. Nutrition? Hidden spinach!

## Trick 2: Cauliflower in Mac & Cheese

Phool gobhi boil karke mash karo, cheese sauce mein mix karo. Volume badhta hai, calories kam hoti hain, taste same rehta hai.

**Tip:** 50/50 ratio se shuru karo — gobhi 50%, actual pasta 50%. Gradually gobhi badhao.

## Trick 3: Ragi in Cookies

Ragi (finger millet) ka dark colour chocolate chips ki wajah se hide ho jaata hai perfectly!

- 1 cup ragi flour + 1/2 cup atta
- 1/2 cup jaggery powder
- 1/4 cup ghee/butter
- 1 egg
- 1/2 cup dark chocolate chips

**Result:** Crunchy, chocolatey cookies with hidden superfood nutrition.

## Trick 4: Dal in Pasta Sauce

Masoor dal ya moong dal boil karke completely blend karo. Tomato pasta sauce mein mix karo. Protein doubles, kids never know.

**Tip:** Red lentils (masoor) blend completely smooth aur sauce ka colour bhi nahi change hota.

## Trick 5: Zucchini in Paratha

Zucchini (lauki bhi kaam karta hai) grate karo, excess moisture squeeze karo, atta mein mix karo. Soft parathas — bacche surprisingly love it!

## Start with These 3 Today

- Spinach in chocolate smoothie
- Ragi in any cookie/biscuit recipe
- Grated zucchini in paratha dough

Teen cheezein — teen wins. Kal se shuru karo!`,
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
            Is topic pe aur seekhna chahte ho?
          </p>
          <p className="mt-2 text-muted-foreground">
            Akta Mahajan ke saath live ya online — aap choose karo
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="pill">
              <Link href="/courses">Free Courses Dekho &rarr;</Link>
            </Button>
            <Button asChild variant="outline" size="pill">
              <Link href="/live-classes">Live Class Join Karo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
