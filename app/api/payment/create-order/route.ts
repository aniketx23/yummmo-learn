import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { courseId?: string };
  if (!body.courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const { data: course, error: cErr } = await supabase
    .from("courses")
    .select("id, title, price, is_free, is_published")
    .eq("id", body.courseId)
    .single();

  if (cErr || !course || !course.is_published) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (course.is_free) {
    return NextResponse.json({ error: "Course is free" }, { status: 400 });
  }

  const amountPaise = Math.round(parseFloat(String(course.price)) * 100);
  if (amountPaise <= 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  try {
    const rzp = getRazorpayInstance();
    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `yl_${course.id}_${user.id}`.slice(0, 40),
      notes: { courseId: course.id, userId: user.id },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      courseTitle: course.title,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Payment error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
