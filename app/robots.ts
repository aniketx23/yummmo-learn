import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL || "https://yummmo-learn.vercel.app"
  ).replace(/\/+$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/auth",
        "/dashboard",
        "/profile",
        "/my-courses",
        "/learn",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
