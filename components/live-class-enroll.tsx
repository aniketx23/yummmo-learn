"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const steps = [
  { key: "name", label: "What's your name?", placeholder: "Full name", type: "text" },
  { key: "phone", label: "Your phone number", placeholder: "+91 98765 43210", type: "tel" },
  { key: "age", label: "Your age", placeholder: "e.g. 32", type: "number" },
  { key: "gender", label: "Gender", placeholder: "", type: "select", options: ["Female", "Male", "Other", "Prefer not to say"] },
  { key: "date", label: "Pick a date for the class", placeholder: "", type: "date" },
  { key: "slot", label: "Preferred time slot", placeholder: "", type: "select", options: ["Morning (9 AM - 12 PM)", "Afternoon (1 PM - 4 PM)", "Evening (5 PM - 8 PM)"] },
] as const;

type FormData = Record<string, string>;

export function LiveClassEnroll({ liveClassId, buttonLabel }: { liveClassId?: string; buttonLabel?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({});
  const [submitting, setSubmitting] = useState(false);

  const current = steps[step];
  const value = data[current.key] ?? "";
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  function next() {
    if (!value.trim()) {
      toast.error("Please fill this field");
      return;
    }
    if (isLast) {
      submit();
    } else {
      setStep((s) => s + 1);
    }
  }

  function back() {
    if (!isFirst) setStep((s) => s - 1);
  }

  async function submit() {
    setSubmitting(true);
    const r = await fetch("/api/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        live_class_id: liveClassId || null,
        full_name: data.name,
        phone: data.phone,
        age: data.age ? parseInt(data.age) : null,
        gender: data.gender || null,
        preferred_date: data.date || null,
        preferred_slot: data.slot || null,
      }),
    });
    setSubmitting(false);
    if (r.ok) {
      toast.success("You're enrolled! We'll send you the details soon.");
      setOpen(false);
      setStep(0);
      setData({});
    } else {
      const j = (await r.json()) as { error?: string };
      toast.error(j.error ?? "Registration failed. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setStep(0); setData({}); } }}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-lg px-8 py-6">
          {buttonLabel ?? "Enroll in Live Class"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Live Class Registration
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
          </p>
        </DialogHeader>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="space-y-4 py-4">
          <Label className="text-lg font-medium">{current.label}</Label>

          {current.type === "select" ? (
            <div className="space-y-2">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, [current.key]: opt }))}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                    value === opt
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : current.type === "date" ? (
            <Input
              type="date"
              value={value}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setData((d) => ({ ...d, [current.key]: e.target.value }))
              }
              className="text-base"
            />
          ) : (
            <Input
              type={current.type}
              placeholder={current.placeholder}
              value={value}
              onChange={(e) =>
                setData((d) => ({ ...d, [current.key]: e.target.value }))
              }
              className="text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  next();
                }
              }}
            />
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={back}
            disabled={isFirst}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <Button onClick={next} disabled={submitting || !value.trim()}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLast ? "Submit" : "Next"}
            {!isLast && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
