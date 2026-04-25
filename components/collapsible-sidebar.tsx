"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function CollapsibleSidebar({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:contents">
      {/* Toggle button: mobile only */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border-b bg-white px-4 py-3 text-sm font-medium lg:hidden"
      >
        <span>{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content: collapsed on mobile by default, always visible on lg+ */}
      <div className={`${open ? "block" : "hidden"} lg:block`}>
        {children}
      </div>
    </div>
  );
}
