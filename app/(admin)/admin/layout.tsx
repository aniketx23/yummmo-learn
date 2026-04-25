import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSidebar, AdminMobileNav } from "@/components/admin-sidebar";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileAppRole, isStaffRole } from "@/lib/profile-role";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");

  const role = await fetchProfileAppRole(supabase, user.id);
  if (!isStaffRole(role)) {
    redirect("/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const adminUser = { name: profile?.full_name, role: profile?.role };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-cream">
      <AdminSidebar user={adminUser} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:hidden">
          <AdminMobileNav user={adminUser} />
          <Link href="/admin" className="font-display font-bold text-primary">
            Admin
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground"
          >
            Back to site
          </Link>
        </header>
        <div className="flex-1 overflow-x-hidden p-4 md:p-8">
          <AdminBreadcrumbs />
          {children}
        </div>
      </div>
    </div>
  );
}
