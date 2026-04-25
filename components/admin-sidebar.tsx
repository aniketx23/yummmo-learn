"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Receipt,
  LineChart,
  Radio,
  Menu,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/enrollments", label: "Enrollments", icon: Receipt },
  { href: "/admin/revenue", label: "Revenue", icon: LineChart },
  { href: "/admin/live-classes", label: "Live Classes", icon: Radio },
];

type UserInfo = {
  name?: string | null;
  role?: string | null;
};

function NavItems({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          onClick={onClick}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted",
            pathname === it.href ||
              (it.href !== "/admin" && pathname.startsWith(it.href))
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground"
          )}
        >
          <it.icon className="h-4 w-4" />
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

function UserRow({ user }: { user: UserInfo }) {
  const router = useRouter();
  const initials = user.name ? user.name[0].toUpperCase() : "A";
  const roleLabel = user.role === "super_admin" ? "Super Admin" : "Instructor";

  async function signOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-2 border-t px-3 py-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{user.name ?? "Admin"}</p>
          <Badge variant="secondary" className="mt-0.5 text-[10px] px-1.5 py-0">
            {roleLabel}
          </Badge>
        </div>
      </div>
      <button
        onClick={() => void signOut()}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-destructive hover:bg-muted"
      >
        <LogOut className="h-3.5 w-3.5" />
        Log out
      </button>
    </div>
  );
}

export function AdminSidebar({ user }: { user?: UserInfo }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-white md:flex md:flex-col">
      <div className="p-4 font-display text-lg font-bold text-primary">
        Admin
      </div>
      <div className="flex-1 px-2 pb-6">
        <NavItems />
      </div>
      {user && <UserRow user={user} />}
      <div className="border-t px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}

export function AdminMobileNav({ user }: { user?: UserInfo }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="font-display text-primary">Admin</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <NavItems onClick={() => setOpen(false)} />
        </div>
        {user && <UserRow user={user} />}
        <div className="mt-6 border-t pt-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            Back to site
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
