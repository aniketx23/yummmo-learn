import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
    full_name?: string | null;
    phone?: string | null;
  };

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: body.full_name ?? null,
      phone: body.phone ?? null,
      email: user.email ?? null,
      role: "student",
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await postN8nWebhook(process.env.N8N_NEW_USER_WEBHOOK_URL, {
    type: "new_user",
    userId: user.id,
    email: user.email,
    full_name: body.full_name,
    phone: body.phone,
  });

  return NextResponse.json({ ok: true });
}
