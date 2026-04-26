import Link from "next/link";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Minimal conversion header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-primary"
          >
            Yummmo Learn
          </Link>
          <a
            href="#register"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Register Now
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Minimal contact footer */}
      <footer className="border-t bg-white/80 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p className="font-display font-semibold text-primary">Yummmo Learn</p>
          <p className="mt-2">
            B2 1602, Cleo County, Sector 121, Noida
          </p>
          <p className="mt-1">
            WhatsApp:{" "}
            <a href="https://wa.me/919818771280" className="text-primary hover:underline">
              9818771280
            </a>
            {" · "}
            Call:{" "}
            <a href="tel:+918459999991" className="text-primary hover:underline">
              8459999991
            </a>
          </p>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} Yummmo Learn. Part of the Yummmo brand.
          </p>
        </div>
      </footer>
    </div>
  );
}
