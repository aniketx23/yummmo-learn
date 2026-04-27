"use client";

export function WhatsAppShare({
  title,
  dateStr,
  city,
}: {
  title: string;
  dateStr: string;
  city: string;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const url =
      typeof window !== "undefined" ? window.location.href : "";
    const text = `🎂 Join me at Yummmo Baking Workshop!\n\n${title}\n📅 ${dateStr}\n📍 ${city}\n\nRegister here: ${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <a
      href="#"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#22c55e]"
    >
      💬 Share on WhatsApp
    </a>
  );
}
