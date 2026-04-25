import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST — register for a live class
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    live_class_id?: string;
    full_name: string;
    phone: string;
    email?: string;
    age?: number;
    gender?: string;
    preferred_date?: string;
    preferred_slot?: string;
  };

  if (!body.full_name?.trim() || !body.phone?.trim()) {
    return NextResponse.json(
      { error: "Name and phone are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("live_class_registrations")
    .insert({
      live_class_id: body.live_class_id || null,
      student_id: user.id,
      full_name: body.full_name.trim(),
      phone: body.phone.trim(),
      email: body.email || user.email || null,
      age: body.age || null,
      gender: body.gender || null,
      preferred_date: body.preferred_date || null,
      preferred_slot: body.preferred_slot || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
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
