"use client";

import { cn } from "@/lib/utils";

export function WhatsAppShare({
  title,
  dateStr,
  city,
  shareUrl,
  message,
  label = "Share on WhatsApp",
  className,
}: {
  title: string;
  /** Batch date line. Ignored when `message` is supplied. */
  dateStr?: string;
  /** Batch city line. Ignored when `message` is supplied. */
  city?: string;
  /** Link appended to the default batch message. Defaults to the current URL. */
  shareUrl?: string;
  /** Full prefilled text, used verbatim (already contains its own link). */
  message?: string;
  /** Button text. */
  label?: string;
  /** Extra classes merged onto the button (e.g. full-width on mobile). */
  className?: string;
}) {
  function handleClick() {
    let text = message;
    if (!text) {
      const url =
        shareUrl || (typeof window !== "undefined" ? window.location.href : "");
      const lines = [`🎂 Join me at Yummmo Baking Workshop!`, ``, title];
      if (dateStr) lines.push(`📅 ${dateStr}`);
      if (city) lines.push(`📍 ${city}`);
      lines.push(``, `Register here: ${url}`);
      text = lines.join("\n");
    }
    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const win = window.open(wa, "_blank");
    if (!win) {
      // popup blocked — fall back to same-tab navigation
      window.location.href = wa;
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22c55e]",
        className
      )}
    >
      💬 {label}
    </button>
  );
}
