"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

type Props = {
  courseId: string;
  courseSlug: string;
  isFree: boolean;
  price: number;
  userEmail?: string | null;
  isLoggedIn: boolean;
  enrolled: boolean;
};

export function CoursePurchase({
  courseId,
  courseSlug,
  isFree,
  price,
  userEmail,
  isLoggedIn,
  enrolled,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function enrollFree() {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/enrollments/free", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = (await r.json()) as { error?: string };
      setErr(j.error ?? "Could not enroll");
      return;
    }
    router.push(`/learn/${courseSlug}`);
    router.refresh();
  }

  async function waitRazorpay() {
    for (let i = 0; i < 50; i++) {
      if (typeof window !== "undefined" && window.Razorpay) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error("Payment script failed to load. Refresh and try again.");
  }

  async function buy() {
    setBusy(true);
    setErr(null);
    try {
      await waitRazorpay();
    } catch (e) {
      setBusy(false);
      setErr(e instanceof Error ? e.message : "Payment unavailable");
      return;
    }
    const r = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = (await r.json()) as {
      error?: string;
      keyId?: string;
      orderId?: string;
      amount?: number;
      currency?: string;
      courseTitle?: string;
    };
    if (!r.ok) {
      setBusy(false);
      setErr(data.error ?? "Could not start payment");
      return;
    }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "Yummmo Learn",
      description: data.courseTitle,
      order_id: data.orderId,
      prefill: { email: userEmail ?? "" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        setBusy(true);
        const v = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        if (!v.ok) {
          setBusy(false);
          const j = (await v.json()) as { error?: string };
          setErr(j.error ?? "Verification failed");
          return;
        }
        router.push(`/learn/${courseSlug}`);
        router.refresh();
      },
      modal: {
        ondismiss: () => {
          setBusy(false);
        },
      },
    };

    if (typeof window !== "undefined" && window.Razorpay) {
      new window.Razorpay(options).open();
    }
  }

  if (enrolled) {
    return (
      <Button className="w-full" size="pill" asChild>
        <Link href={`/learn/${courseSlug}`}>Go to course</Link>
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button className="w-full" size="pill" asChild>
        <Link href={`/auth/login?next=/courses/${courseSlug}`}>
          Login to enroll
        </Link>
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {!isFree && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      )}
      {isFree ? (
        <Button
          className="w-full"
          size="pill"
          disabled={busy}
          onClick={() => void enrollFree()}
        >
          Enroll Free — Start Instantly
        </Button>
      ) : (
        <Button
          className="w-full"
          size="pill"
          disabled={busy}
          onClick={() => void buy()}
        >
          Buy now — {formatPrice(price)}
        </Button>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
    </div>
  );
}
