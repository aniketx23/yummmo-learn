import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireStaff(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "super_admin" || profile?.role === "instructor";
}

// GET — list all live classes (including inactive) for admin
export async function GET() {
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("live_classes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}

// POST — create a new live class batch
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    title: string;
    slug?: string | null;
    description?: string;
    schedule_type?: string;
    schedule_days?: string;
    time_slot?: string;
    class_date?: string;
    start_time?: string;
    end_time?: string;
    location?: string | null;
    location_city?: string | null;
    thumbnail_url?: string | null;
    max_spots?: number;
    price?: number;
    is_active?: boolean;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const timeSlot =
    body.time_slot ||
    (body.start_time && body.end_time
      ? `${body.start_time} - ${body.end_time}`
      : null);

  const { data, error } = await supabase
    .from("live_classes")
    .insert({
      title: body.title.trim(),
      slug: body.slug?.trim() || null,
      description: body.description || null,
      schedule_type: body.schedule_type || "custom",
      schedule_days: body.schedule_days || null,
      time_slot: timeSlot,
      class_date: body.class_date || null,
      start_time: body.start_time || null,
      end_time: body.end_time || null,
      location: body.location || null,
      location_city: body.location_city || null,
      thumbnail_url: body.thumbnail_url || null,
      max_spots: body.max_spots ?? 8,
      price: (body.price ?? 0).toFixed(2),
      is_active: body.is_active ?? true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
