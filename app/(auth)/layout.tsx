import { SiteHeader } from "@/components/site-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t bg-white/80 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Yummmo Learn. Part of the Yummmo brand.
      </footer>
    </div>
  );
}
