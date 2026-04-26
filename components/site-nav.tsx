"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  ChefHat,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
};

export function SiteNav({ email, role, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isLoggedIn = !!email;
  const isStaff = role === "super_admin" || role === "instructor";

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const initials = email ? email[0].toUpperCase() : "?";

  return (
    <div className="flex items-center gap-2">
      {/* ── Desktop nav (lg and above) ──────────────────────── */}
      <nav className="hidden items-center gap-1 lg:flex">
        <DesktopLink href="/courses">Courses</DesktopLink>
        <DesktopLink href="/live-classes">Live Classes</DesktopLink>
        <DesktopLink href="/blog">Blog</DesktopLink>
      </nav>

      {isLoggedIn && (
        <div className="hidden items-center gap-1 lg:flex">
          <Separator orientation="vertical" className="mx-2 h-5" />
          <DesktopLink href="/dashboard">Dashboard</DesktopLink>
          {isStaff && <DesktopLink href="/admin">Admin</DesktopLink>}
        </div>
      )}

      {/* ── Desktop auth buttons (logged out, lg+) ─────────── */}
      {!isLoggedIn && (
        <div className="hidden items-center gap-2 lg:flex ml-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/signup">Sign up</Link>
          </Button>
        </div>
      )}

      {/* ── Bell + Avatar (all screens when logged in) ─────── */}
      {isLoggedIn && (
        <>
          <div className="lg:ml-3" />
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Notifications">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          {/* Desktop: avatar with dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden cursor-pointer lg:block">
                <Avatar className="h-8 w-8">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my-courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  My Courses
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => void signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Mobile: plain avatar link */}
          <Link href="/profile" className="lg:hidden">
            <Avatar className="h-8 w-8 cursor-pointer">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Link>
        </>
      )}

      {/* ── Hamburger menu (mobile only, below lg) ─────────── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72">
          <SheetHeader>
            <SheetTitle className="font-display text-primary">
              Yummmo Learn
            </SheetTitle>
          </SheetHeader>

          <nav className="mt-6 space-y-1">
            <NavLink href="/" icon={Home} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink href="/courses" icon={BookOpen} onClick={() => setOpen(false)}>
              All Courses
            </NavLink>
            <Link
              href="/live-classes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>🎂</span>
              Live Classes
            </Link>
            <NavLink href="/categories/baking" icon={ChefHat} onClick={() => setOpen(false)}>
              Categories
            </NavLink>
            <NavLink href="/blog" icon={Newspaper} onClick={() => setOpen(false)}>
              Blog
            </NavLink>
          </nav>

          {isLoggedIn && (
            <>
              <Separator className="my-4" />
              <nav className="space-y-1">
                <NavLink href="/dashboard" icon={LayoutDashboard} onClick={() => setOpen(false)}>
                  Dashboard
                </NavLink>
                <NavLink href="/my-courses" icon={BookOpen} onClick={() => setOpen(false)}>
                  My Courses
                </NavLink>
                <NavLink href="/profile" icon={User} onClick={() => setOpen(false)}>
                  My Profile
                </NavLink>
                {isStaff && (
                  <NavLink href="/admin" icon={ShieldCheck} onClick={() => setOpen(false)}>
                    Admin Panel
                  </NavLink>
                )}
              </nav>
              <Separator className="my-4" />
              <button
                onClick={() => void signOut()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Separator className="my-4" />
              <nav className="space-y-1">
                <NavLink href="/auth/login" icon={LogIn} onClick={() => setOpen(false)}>
                  Log in
                </NavLink>
                <NavLink href="/auth/signup" icon={UserPlus} onClick={() => setOpen(false)}>
                  Sign up
                </NavLink>
              </nav>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ── Desktop horizontal link ──────────────────────────────── */
function DesktopLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
}

/* ── Mobile Sheet nav link ────────────────────────────────── */
function NavLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
