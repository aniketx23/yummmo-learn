import { LandingHeader } from "@/components/landing-header";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <LandingHeader />

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
