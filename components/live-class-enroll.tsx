"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  Loader2,
  MessageCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
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

type Confirmation = {
  name: string;
  phone: string;
  batchTitle: string;
};

/** Akta's WhatsApp business number — the real confirmation channel. */
const WHATSAPP_NUMBER = "918459999991";

const personalSteps = [
  {
    key: "name",
    label: "Your name?",
    placeholder: "Full name",
    type: "text" as const,
  },
  {
    key: "phone",
    label: "Your WhatsApp number",
    sublabel: "Please give the correct number. All class updates come here.",
    placeholder: "98765 43210",
    type: "tel" as const,
  },
];

export function LiveClassEnroll({
  batches = [],
  buttonLabel,
  buttonClassName,
  preSelectedBatchId,
  triggerProps,
}: {
  batches?: Batch[];
  buttonLabel?: string;
  buttonClassName?: string;
  preSelectedBatchId?: string;
  triggerProps?: Record<string, string>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({});
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<Batch | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const totalSteps = personalSteps.length + 1; // +1 for batch selection
  const isOnBatchStep = step === personalSteps.length;
  const currentPersonalStep = step < personalSteps.length ? personalSteps[step] : null;
  const currentValue = currentPersonalStep ? data[currentPersonalStep.key] ?? "" : "";

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
      if (!/^\d{10,15}$/.test(digits)) {
        toast.error("Please enter a correct WhatsApp number (10 digits)");
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

  async function handleSubmit() {
    if (!selectedBatch) {
      toast.error("Please choose a batch first");
      return;
    }

    const name = (data.name ?? "").trim();
    const phone = (data.phone ?? "").replace(/\D/g, "");
    if (!name || !/^\d{10,15}$/.test(phone)) {
      toast.error("Please enter your name and a correct WhatsApp number");
      setStep(0);
      return;
    }

    setSubmitting(true);
    try {
      const r = await fetch("/api/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          live_class_id: selectedBatch.id,
          full_name: name,
          phone,
        }),
      });

      if (r.ok) {
        setConfirmation({ name, phone, batchTitle: selectedBatch.title });
        toast.success("We have your details. Now confirm on WhatsApp.");
      } else {
        // A dropped 4G connection must never look like a silent failure.
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        toast.error(j.error ?? "Registration did not go through. Please try again.");
      }
    } catch {
      toast.error("Network problem. Please try again or message us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  function whatsappConfirmUrl(c: Confirmation) {
    const text = [
      "Hello! I have registered for the workshop.",
      `Name: ${c.name}`,
      `Phone: ${c.phone}`,
      `Batch: ${c.batchTitle}`,
    ].join("\n");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function resetForm() {
    setStep(0);
    setData({});
    setSelectedBatch(null);
    setExpandedBatch(null);
    setConfirmation(null);
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
        if (!v) {
          const registered = confirmation !== null;
          resetForm();
          // Refresh spots-left counts only after the dialog is gone —
          // refreshing while it is open remounts the tree and kills the
          // success screen before the user can tap WhatsApp.
          if (registered) router.refresh();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className={buttonClassName ?? "text-lg px-8 py-6"} {...triggerProps}>
          {buttonLabel ?? "Enroll in Live Class"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {confirmation ? "Done!" : "Live Class Registration"}
          </DialogTitle>
          {!confirmation && (
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </p>
          )}
        </DialogHeader>

        {/* Progress bar */}
        {!confirmation && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{
                width: `${((step + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        )}

        {/* ── Success screen ────────────────────────────── */}
        {confirmation ? (
          <div className="space-y-5 py-2 text-center">
            <div className="space-y-2">
              <CheckCircle2 className="mx-auto h-12 w-12 text-herb" />
              <p className="font-display text-lg font-semibold">
                We have your details, {confirmation.name.split(" ")[0]}!
              </p>
              <p className="text-sm text-muted-foreground">
                One last step. Please confirm on WhatsApp. Akta will send the
                batch details and location there.
              </p>
            </div>

            <a
              href={whatsappConfirmUrl(confirmation)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#1ebe5a]"
            >
              <MessageCircle className="h-5 w-5" />
              Confirm on WhatsApp
            </a>

            <div className="rounded-lg border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Batch:</span>{" "}
                {confirmation.batchTitle}
              </p>
              <p>
                <span className="font-medium text-foreground">Number:</span>{" "}
                {confirmation.phone}
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Close
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
                  Choose your batch
                </Label>
                {batches.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No batches are open right now.
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
                      Send Registration
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
          </div>
        )}

        {/* ── Navigation buttons ──────────────────────── */}
        {!confirmation && !expandedBatch && (
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
