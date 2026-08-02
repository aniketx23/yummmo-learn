import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postN8nWebhook } from "@/lib/n8n";
import { sendLiveClassRegistrationAlert } from "@/lib/resend";

/** Registrations come from strangers on WhatsApp — cap the free-text fields. */
const MAX_FIELD = 200;

// POST — register interest in a live class. Open to anonymous visitors:
// most people arrive from a forwarded WhatsApp link and have no account.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = (await request.json()) as {
    live_class_id?: string;
    full_name?: string;
    phone?: string;
    email?: string;
  };

  const fullName = (body.full_name ?? "").trim().slice(0, MAX_FIELD);
  const phone = (body.phone ?? "").trim().slice(0, MAX_FIELD);
  const email =
    (body.email ?? "").trim().slice(0, MAX_FIELD) || user?.email || null;

  if (!fullName || !phone) {
    return NextResponse.json(
      { error: "Name and phone are required" },
      { status: 400 }
    );
  }

  // Anonymous inserts are blocked by RLS, so write with the service role.
  const admin = createAdminClient();
  const batchId = body.live_class_id || null;

  const { data, error } = await admin
    .from("live_class_registrations")
    .insert({
      live_class_id: batchId,
      student_id: user?.id ?? null,
      full_name: fullName,
      phone,
      email,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // The row is saved — from here nothing may fail the registration.
  let batchTitle: string | null = null;
  let preferredSlot: string | null = null;
  try {
    if (batchId) {
      const { data: batch } = await admin
        .from("live_classes")
        .select("title, time_slot, start_time, end_time, class_date")
        .eq("id", batchId)
        .maybeSingle();
      if (batch) {
        batchTitle = batch.title ?? null;
        preferredSlot =
          batch.start_time && batch.end_time
            ? `${batch.start_time} - ${batch.end_time}`
            : batch.time_slot ?? batch.class_date ?? null;
      }
    }

    await Promise.allSettled([
      postN8nWebhook(process.env.N8N_WEBHOOK_LIVE_CLASS, {
        event: "live_class_registration",
        registration_id: data.id,
        live_class_id: batchId,
        batch_title: batchTitle,
        preferred_slot: preferredSlot,
        full_name: fullName,
        phone,
        email,
        student_id: user?.id ?? null,
        submitted_at: new Date().toISOString(),
      }),
      sendLiveClassRegistrationAlert({
        fullName,
        phone,
        batchTitle,
        preferredSlot,
      }),
    ]);
  } catch (e) {
    console.error("live class registration alerts failed", e);
  }

  return NextResponse.json({ id: data.id });
}

// GET — list active live classes (public)
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_classes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
