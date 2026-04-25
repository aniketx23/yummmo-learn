"use client";

import { useEffect, useState } from "react";

export function BunnyVideoPlayer({ videoId }: { videoId: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/video/token/${videoId}`);
      if (!res.ok) return;
      const data = (await res.json()) as { url: string };
      if (!cancelled) setSrc(data.url);
    })();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-[#0f0f0f] text-sm text-white/70">
        Loading player…
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#0f0f0f]">
      <iframe
        src={src}
        title="Lesson video"
        className="h-full w-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
    </div>
  );
}
