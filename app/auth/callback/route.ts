import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileAppRole, isStaffRole } from "@/lib/profile-role";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = nextParam ?? "/dashboard";

  // Handle email change confirmation (Supabase sends type=email_change)
  const type = searchParams.get("type");
  if (type === "email_change") {
    return NextResponse.redirect(`${origin}/profile?email_updated=1`);
  }

  let destination = next;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if profile has phone number — if not, redirect to complete profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.phone) {
        destination = "/profile?complete=1";
      } else {
        const role = await fetchProfileAppRole(supabase, user.id);
        const isDefaultLanding =
          nextParam === null || nextParam === "" || next === "/dashboard";

        if (isStaffRole(role) && isDefaultLanding) {
          destination = "/admin";
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
