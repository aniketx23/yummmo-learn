"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: e } = await supabase.auth.resetPasswordForEmail(
      values.email,
      { redirectTo: `${origin}/auth/reset-password` }
    );
    if (e) {
      setError(e.message);
      return;
    }
    setMessage("If an account exists, you will receive a reset link shortly.");
  }

  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we will send you a link.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
          {message && (
            <p className="text-sm font-medium text-herb">{message}</p>
          )}
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
