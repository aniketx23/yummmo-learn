import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <Suspense
      fallback={<Skeleton className="mx-auto h-96 w-full max-w-md rounded-2xl" />}
    >
      <LoginForm />
    </Suspense>
  );
}
