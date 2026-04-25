import Link from "next/link";
import { SiteNav } from "@/components/site-nav";

type Props = {
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
};

export function SiteHeader({ email, role, avatarUrl }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-primary"
        >
          Yummmo Learn
        </Link>
        <SiteNav email={email} role={role} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
