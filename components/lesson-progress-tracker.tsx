"use client";

import { useEffect, useRef } from "react";

type Props = {
  lessonId: string;
  courseId: string;
  durationSeconds: number;
};

export function LessonProgressTracker({
  lessonId,
  courseId,
  durationSeconds,
}: Props) {
  const lastSent = useRef(0);

  useEffect(() => {
    const video = document.querySelector("video");
    if (!video) return;

    const tick = async () => {
      const t = Math.floor(video.currentTime || 0);
      if (Math.abs(t - lastSent.current) < 5) return;
      lastSent.current = t;
      await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          courseId,
          lastWatchedSeconds: t,
        }),
      });

      const dur = durationSeconds || Math.floor(video.duration || 0);
      if (dur > 0 && video.currentTime / dur >= 0.9) {
        await fetch("/api/progress/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, courseId }),
        });
      }
    };

    const id = window.setInterval(() => {
      void tick();
    }, 30000);

    const onEnded = () => {
      void fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, courseId }),
      });
    };

    video.addEventListener("ended", onEnded);
    return () => {
      window.clearInterval(id);
      video.removeEventListener("ended", onEnded);
    };
  }, [lessonId, courseId, durationSeconds]);

  return null;
}
