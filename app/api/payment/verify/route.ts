import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendPurchaseConfirmation } from "@/lib/resend";
import { postN8nWebhook } from "@/lib/n8n";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    courseId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };

  if (
    !body.courseId ||
    !body.razorpay_order_id ||
    !body.razorpay_payment_id ||
    !body.razorpay_signature
  ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const ok = verifyRazorpaySignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature
  );
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: course } = await admin
    .from("courses")
    .select("id, title, price")
    .eq("id", body.courseId)
    .single();
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const amount = parseFloat(String(course.price));

  const { data: payment, error: pErr } = await admin
    .from("payments")
    .insert({
      student_id: user.id,
      course_id: course.id,
      razorpay_order_id: body.razorpay_order_id,
      razorpay_payment_id: body.razorpay_payment_id,
      razorpay_signature: body.razorpay_signature,
      amount,
      currency: "INR",
      status: "completed",
    })
    .select("id")
    .single();

  if (pErr || !payment) {
    return NextResponse.json({ error: pErr?.message ?? "Payment save failed" }, { status: 500 });
  }

  const { error: eErr } = await admin.from("enrollments").upsert(
    {
      student_id: user.id,
      course_id: course.id,
      is_free: false,
      payment_id: payment.id,
    },
    { onConflict: "student_id,course_id" }
  );

  if (eErr) {
    return NextResponse.json({ error: eErr.message }, { status: 500 });
  }

  const email = user.email ?? null;
  if (email) {
    await sendPurchaseConfirmation({
      to: email,
      courseTitle: course.title,
      amount,
    });
  }

  await postN8nWebhook(process.env.N8N_ENROLLMENT_WEBHOOK_URL, {
    type: "paid_enrollment",
    userId: user.id,
    email,
    courseId: course.id,
    courseTitle: course.title,
    amount,
  });

  return NextResponse.json({ ok: true });
}
