import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "super_admin" && profile?.role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    course_id: string;
    title: string;
    display_order?: number;
  };

  if (!body.course_id || !body.title?.trim()) {
    return NextResponse.json({ error: "course_id and title required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("sections")
    .insert({
      course_id: body.course_id,
      title: body.title.trim(),
      display_order: body.display_order ?? 0,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
