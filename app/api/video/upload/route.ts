import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadVideoToBunny } from "@/lib/bunny";

export const runtime = "nodejs";

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

  const form = await request.formData();
  const videoId = form.get("videoId")?.toString();
  const file = form.get("file");
  if (!videoId || !(file instanceof Blob)) {
    return NextResponse.json({ error: "videoId and file required" }, { status: 400 });
  }

  const buf = await file.arrayBuffer();
  try {
    await uploadVideoToBunny(videoId, buf);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
