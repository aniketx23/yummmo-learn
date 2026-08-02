"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type GrantCourse = { id: string; title: string };

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function QuickGrant({ courses }: { courses: GrantCourse[] }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);

  async function grant() {
    const value = identifier.trim();
    if (!courseId) {
      toast.error("Pehle ek cake tutorial banao");
      return;
    }
    if (!value) {
      toast.error("Enter an email or phone number");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/admin/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, identifier: value }),
    });
    const j = (await r.json()) as { error?: string };
    setBusy(false);
    if (!r.ok) {
      toast.error(j.error ?? "Could not grant access");
      return;
    }
    toast.success("Access granted");
    setIdentifier("");
    router.refresh();
  }

  if (courses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Pehle ek cake tutorial banao, phir yahan se access de sakte ho.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div className="space-y-1.5">
        <Label className="text-xs">Which cake?</Label>
        <select
          className={selectClass}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Student email or phone</Label>
        <Input
          placeholder="email or phone number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void grant();
          }}
        />
      </div>
      <Button size="lg" disabled={busy} onClick={() => void grant()}>
        {busy ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="mr-2 h-4 w-4" />
        )}
        Grant access
      </Button>
    </div>
  );
}
