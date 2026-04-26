"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Valid email address daalo");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setEmail("");
    toast.success("Subscribed! Weekly tips aapke inbox mein aayenge 🎉");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <Input
        type="email"
        placeholder="aapki@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 border-white/30 bg-white/20 text-white placeholder:text-white/70"
        required
      />
      <Button
        type="submit"
        disabled={loading}
        className="shrink-0 rounded-full bg-white px-6 font-semibold text-primary hover:bg-white/90"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}
