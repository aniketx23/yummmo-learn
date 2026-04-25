import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const level = searchParams.get("level");
  const isFree = searchParams.get("is_free");
  const sort = searchParams.get("sort") ?? "newest";

  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select(
      "id, slug, title, short_description, thumbnail_url, price, original_price, is_free, total_lessons, total_duration_minutes, level, language, category_id, created_at"
    )
    .eq("is_published", true);

  if (q) {
    query = query.textSearch("search_vector", q, {
      type: "websearch",
      config: "english",
    });
  }
  if (category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    if (cat?.id) query = query.eq("category_id", cat.id);
  }
  if (level && ["Beginner", "Intermediate", "Advanced"].includes(level)) {
    query = query.eq("level", level);
  }
  if (isFree === "1" || isFree === "true") {
    query = query.eq("is_free", true);
  }
  if (isFree === "0" || isFree === "false") {
    query = query.eq("is_free", false);
  }

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ courses: data ?? [] });
}
