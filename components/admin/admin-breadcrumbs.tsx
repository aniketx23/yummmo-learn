"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labels: Record<string, string> = {
  admin: "Dashboard",
  courses: "Courses",
  new: "New Course",
  edit: "Edit",
  students: "Students",
  enrollments: "Enrollments",
  revenue: "Revenue",
  "live-classes": "Live Classes",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  // Only show breadcrumbs when deeper than /admin
  if (parts.length <= 1) return null;

  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const part of parts) {
    path += `/${part}`;
    // Skip UUID-like segments in display
    const isUuid = /^[0-9a-f-]{36}$/.test(part);
    const label = isUuid ? "..." : labels[part] ?? part;
    crumbs.push({ label, href: path });
  }

  return (
    <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-primary">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
