/**
 * Extracts a YouTube video ID from any common YouTube URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * Returns null if not a YouTube URL.
 */
export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "m.youtube.com"
    ) {
      if (u.pathname === "/watch") {
        return u.searchParams.get("v");
      }
      const embedMatch = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]+)/);
      if (embedMatch) return embedMatch[1];
      return null;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return id || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns a YouTube embed URL from any YouTube URL.
 * Returns null if not a valid YouTube URL.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}
