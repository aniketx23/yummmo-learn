"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  function openRegister() {
    // Find the first LiveClassEnroll trigger button on the page and click it
    const btn = document.querySelector<HTMLButtonElement>(
      "[data-register-trigger]"
    );
    if (btn) {
      btn.click();
    } else {
      // Fallback: scroll to register section
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-primary"
        >
          Yummmo Learn
        </Link>
        <Button size="sm" onClick={openRegister}>
          Register Now
        </Button>
      </div>
    </header>
  );
}
