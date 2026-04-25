import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBunnyVideo } from "@/lib/bunny";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "super_admin" && profile?.role !== "instructor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { title?: string };
  const title = body.title?.trim() || "Lesson video";

  try {
    const created = await createBunnyVideo(title);
    return NextResponse.json({ videoId: created.guid });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bunny error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
