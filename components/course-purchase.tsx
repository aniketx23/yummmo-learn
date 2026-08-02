"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  courseSlug: string;
  isLoggedIn: boolean;
  enrolled: boolean;
};

/**
 * Access-state CTA for a workshop tutorial course.
 * No payments — access is granted by an admin to workshop attendees.
 */
export function CoursePurchase({ courseSlug, isLoggedIn, enrolled }: Props) {
  if (enrolled) {
    return (
      <Button className="w-full" size="pill" asChild>
        <Link href={`/learn/${courseSlug}`}>Watch Now</Link>
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button className="w-full" size="pill" variant="outline" asChild>
        <Link href={`/auth/login?next=/courses/${courseSlug}`}>
          Login to check access
        </Link>
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-center">
      <Lock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-sm font-semibold">Access is given after the workshop</p>
      <p className="mt-1 text-xs text-muted-foreground">
        This tutorial is for students who attend our workshop. Please contact us
        to get access.
      </p>
    </div>
  );
}
