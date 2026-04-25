import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getUserWithProfile } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getUserWithProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader email={user?.email} role={profile?.role} avatarUrl={profile?.avatar_url} />
      <main className="flex-1">{children}</main>
      <SiteFooter isLoggedIn={!!user} />
    </div>
  );
}
