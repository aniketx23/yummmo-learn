"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

type Batch = {
  id: string;
  title: string;
  description: string | null;
  class_date: string | null;
  start_time: string | null;
  end_time: string | null;
  time_slot: string | null;
  schedule_days: string | null;
  max_spots: number;
  price: string | number;
  is_active: boolean;
};

type FormData = Record<string, string>;

const STORAGE_KEY = "pending_live_class_reg";

const personalSteps = [
  {
    key: "name",
    label: "Aapka naam?",
    placeholder: "Full name",
    type: "text" as const,
  },
  {
    key: "phone",
    label: "WhatsApp number daalein",
    sublabel: "Sahi number do — class updates isi pe aayenge",
    placeholder: "98765 43210",
    type: "tel" as const,
  },
  {
    key: "age",
    label: "Aapki age?",
    placeholder: "e.g. 32",
    type: "number" as const,
  },
  {
    key: "gender",
    label: "Gender",
    placeholder: "",
    type: "select" as const,
    options: ["Female", "Male", "Other", "Prefer not to say"],
  },
];

export function LiveClassEnroll({
  batches = [],
  buttonLabel,
  buttonClassName,
  preSelectedBatchId,
  autoRegister,
}: {
  batches?: Batch[];
  buttonLabel?: string;
  buttonClassName?: string;
  preSelectedBatchId?: string;
  autoRegister?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({});
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<Batch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const totalSteps = personalSteps.length + 1; // +1 for batch selection
  const isOnBatchStep = step === personalSteps.length;
  const currentPersonalStep = step < personalSteps.length ? personalSteps[step] : null;
  const currentValue = currentPersonalStep ? data[currentPersonalStep.key] ?? "" : "";

  // Auto-register from localStorage after login redirect
  useEffect(() => {
    if (!autoRegister) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const pending = JSON.parse(saved) as { data: FormData; batchId: string };
      setData(pending.data);
      const batch = batches.find((b) => b.id === pending.batchId);
      if (batch) setSelectedBatch(batch);
      localStorage.removeItem(STORAGE_KEY);
      setOpen(true);
      // Auto-submit after a short delay
      setTimeout(() => {
        void submitRegistration(pending.data, pending.batchId);
      }, 500);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRegister]);

  // Pre-select batch if provided
  useEffect(() => {
    if (preSelectedBatchId) {
      const batch = batches.find((b) => b.id === preSelectedBatchId);
      if (batch) setSelectedBatch(batch);
    }
  }, [preSelectedBatchId, batches]);

  function validateCurrentStep(): boolean {
    if (!currentPersonalStep) return true;
    const val = currentValue.trim();
    if (!val) {
      toast.error("Please fill this field");
      return false;
    }
    if (currentPersonalStep.key === "phone") {
      const digits = val.replace(/\D/g, "");
      if (!/^\d{10}$/.test(digits)) {
        toast.error("10-digit phone number daalein");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validateCurrentStep()) return;
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    }
  }

  function back() {
    if (expandedBatch) {
      setExpandedBatch(null);
      return;
    }
    if (step > 0) setStep((s) => s - 1);
  }

  function chooseBatch(batch: Batch) {
    setSelectedBatch(batch);
    setExpandedBatch(null);
  }

  async function submitRegistration(formData: FormData, batchId: string) {
    setSubmitting(true);
    const phone = (formData.phone ?? "").replace(/\D/g, "");
    const r = await fetch("/api/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        live_class_id: batchId,
        full_name: formData.name,
        phone,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
      }),
    });
    setSubmitting(false);
    if (r.ok) {
      toast.success("Registration ho gaya! Details jaldi WhatsApp pe aayenge.");
      setOpen(false);
      resetForm();
      router.refresh();
    } else {
      const j = (await r.json()) as { error?: string };
      toast.error(j.error ?? "Registration fail ho gayi. Dobara try karein.");
    }
  }

  async function handleSubmit() {
    if (!selectedBatch) {
      toast.error("Pehle ek batch choose karein");
      return;
    }

    // Check if user is logged in
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Save to localStorage and show login prompt
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data, batchId: selectedBatch.id })
      );
      setShowLogin(true);
      return;
    }

    await submitRegistration(data, selectedBatch.id);
  }

  async function loginWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/live-classes?auto_register=1`,
      },
    });
  }

  function resetForm() {
    setStep(0);
    setData({});
    setSelectedBatch(null);
    setExpandedBatch(null);
    setShowLogin(false);
  }

  function formatBatchTime(batch: Batch) {
    if (batch.start_time && batch.end_time) return `${batch.start_time} - ${batch.end_time}`;
    if (batch.time_slot) return batch.time_slot;
    return null;
  }

  const batchPrice = (batch: Batch) => {
    const p = typeof batch.price === "string" ? parseFloat(batch.price) : batch.price;
    return p;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className={buttonClassName ?? "text-lg px-8 py-6"}>
          {buttonLabel ?? "Enroll in Live Class"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Live Class Registration
          </DialogTitle>
          {!showLogin && (
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </p>
          )}
        </DialogHeader>

        {/* Progress bar */}
        {!showLogin && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{
                width: `${((step + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        )}

        {/* ── Login prompt (shown after form fill for guests) ── */}
        {showLogin ? (
          <div className="space-y-4 py-4 text-center">
            <div className="space-y-2">
              <p className="font-display text-lg font-semibold">
                Almost done!
              </p>
              <p className="text-sm text-muted-foreground">
                Registration complete karne ke liye login karein — sirf 10
                second lagenge!
              </p>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => void loginWithGoogle()}
              >
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <a href={`/auth/login?next=/live-classes?auto_register=1`}>
                  Login with Email
                </a>
              </Button>
            </div>
            <button
              onClick={() => setShowLogin(false)}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              ← Back to form
            </button>
          </div>
        ) : isOnBatchStep ? (
          /* ── Batch selection step ──────────────────────── */
          <div className="space-y-4 py-2">
            {expandedBatch ? (
              /* Expanded single batch view */
              <div className="space-y-4">
                <button
                  onClick={() => setExpandedBatch(null)}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  All Batches
                </button>
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-semibold">
                    {expandedBatch.title}
                  </h3>
                  {expandedBatch.description && (
                    <p className="text-sm text-muted-foreground">
                      {expandedBatch.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {expandedBatch.class_date && (
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        {formatDate(expandedBatch.class_date)}
                      </p>
                    )}
                    {formatBatchTime(expandedBatch) && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        {formatBatchTime(expandedBatch)}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Users className="h-4 w-4 shrink-0" />
                      {expandedBatch.max_spots} spots per batch
                    </p>
                    <p className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 shrink-0" />
                      {batchPrice(expandedBatch) > 0
                        ? `₹${batchPrice(expandedBatch)}`
                        : "Free"}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => chooseBatch(expandedBatch)}
                  >
                    Choose This Batch
                  </Button>
                </div>
              </div>
            ) : (
              /* Batch cards list */
              <div className="space-y-3">
                <Label className="text-lg font-medium">
                  Batch choose karein
                </Label>
                {batches.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Abhi koi batch available nahi hai.
                  </p>
                ) : (
                  batches.map((batch) => (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => setExpandedBatch(batch)}
                      className={`w-full rounded-lg border p-4 text-left transition ${
                        selectedBatch?.id === batch.id
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{batch.title}</p>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {batch.class_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(batch.class_date)}
                              </span>
                            )}
                            {formatBatchTime(batch) && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatBatchTime(batch)}
                              </span>
                            )}
                          </div>
                        </div>
                        {batchPrice(batch) > 0 ? (
                          <Badge variant="secondary">₹{batchPrice(batch)}</Badge>
                        ) : (
                          <Badge variant="herb">Free</Badge>
                        )}
                      </div>
                    </button>
                  ))
                )}

                {/* Selected batch summary + submit */}
                {selectedBatch && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-sm font-medium">
                      Selected: {selectedBatch.title}
                    </p>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => void handleSubmit()}
                      disabled={submitting}
                    >
                      {submitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Registration
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── Personal info steps ─────────────────────── */
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-lg font-medium">
                {currentPersonalStep?.label}
              </Label>
              {currentPersonalStep?.sublabel && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentPersonalStep.sublabel}
                </p>
              )}
            </div>

            {currentPersonalStep?.type === "select" ? (
              <div className="space-y-2">
                {currentPersonalStep.options?.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setData((d) => ({
                        ...d,
                        [currentPersonalStep.key]: opt,
                      }))
                    }
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                      currentValue === opt
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <Input
                type={currentPersonalStep?.type ?? "text"}
                placeholder={currentPersonalStep?.placeholder}
                value={currentValue}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    [currentPersonalStep!.key]: e.target.value,
                  }))
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
        )}

        {/* ── Navigation buttons ──────────────────────── */}
        {!showLogin && !expandedBatch && (
          <div className="flex justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            {!isOnBatchStep && (
              <Button onClick={next} disabled={!currentValue.trim()}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
