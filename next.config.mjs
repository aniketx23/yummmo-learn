/** @type {import('next').NextConfig} */
const remotePatterns = [
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
];

try {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (u) {
    const host = new URL(u).hostname;
    remotePatterns.push({
      protocol: "https",
      hostname: host,
      pathname: "/storage/v1/object/public/**",
    });
  }
} catch {
  /* ignore invalid env during tooling */
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
