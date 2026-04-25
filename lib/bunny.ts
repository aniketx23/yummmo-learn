const apiBase = "https://video.bunnycdn.com";

export function getBunnyConfig() {
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;
  const tokenAuthKey = process.env.BUNNY_TOKEN_AUTH_KEY;
  if (!apiKey || !libraryId) {
    throw new Error("Missing Bunny Stream API key or library ID");
  }
  return { apiKey, libraryId, cdnHostname, tokenAuthKey };
}

export async function createBunnyVideo(title: string) {
  const { apiKey, libraryId } = getBunnyConfig();
  const res = await fetch(`${apiBase}/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny create video failed: ${res.status} ${text}`);
  }
  return (await res.json()) as { guid: string; title: string };
}

export async function uploadVideoToBunny(videoId: string, file: ArrayBuffer) {
  const { apiKey, libraryId } = getBunnyConfig();
  const res = await fetch(`${apiBase}/library/${libraryId}/videos/${videoId}`, {
    method: "PUT",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/octet-stream",
    },
    body: file,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny upload failed: ${res.status} ${text}`);
  }
}

export function embedIframeUrl(videoId: string, token?: string) {
  const base = `https://iframe.mediadelivery.net/embed/${videoId}`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}
