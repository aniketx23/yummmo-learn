"use client";

export function WhatsAppShare({
  title,
  dateStr,
  city,
  shareUrl,
}: {
  title: string;
  dateStr: string;
  city: string;
  shareUrl?: string;
}) {
  function handleClick() {
    const url =
      shareUrl ||
      (typeof window !== "undefined" ? window.location.href : "");
    const text = `🎂 Join me at Yummmo Baking Workshop!\n\n${title}\n📅 ${dateStr}\n📍 ${city}\n\nRegister here: ${url}`;
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
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22c55e]"
    >
      💬 Share on WhatsApp
    </button>
  );
}
