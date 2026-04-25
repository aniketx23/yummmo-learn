"use client";

import { getYouTubeEmbedUrl } from "@/lib/video";

export function YouTubePlayer({ url }: { url: string }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-cream text-center">
        <p className="text-lg font-medium text-primary">
          Video bahut jaldi aane wala hai! 🎬
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#0f0f0f]">
      <iframe
        src={embedUrl}
        title="Lesson video"
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
