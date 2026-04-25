import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const staticUrls: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date() },
    { url: `${base}/courses`, lastModified: new Date() },
  ];

  try {
    const supabase = await createClient();
    const { data: courses } = await supabase
      .from("courses")
      .select("slug, updated_at")
      .eq("is_published", true);

    const courseUrls =
      courses?.map((c) => ({
        url: `${base}/courses/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      })) ?? [];

    return [...staticUrls, ...courseUrls];
  } catch {
    return staticUrls;
  }
}
