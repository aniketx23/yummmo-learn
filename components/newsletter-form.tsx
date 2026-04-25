"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thanks for subscribing! We'll be in touch.");
    setEmail("");
  }

  return (
    <form className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="Your email address"
        className="flex-1"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit">Subscribe</Button>
    </form>
  );
}
