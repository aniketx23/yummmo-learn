import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireStaff(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "super_admin" && profile?.role !== "instructor")
    return null;
  return user;
}

/** Grant a specific person access to a course (admin-driven enrollment). */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    courseId?: string;
    identifier?: string;
  };
  const courseId = body.courseId?.trim();
  const identifier = body.identifier?.trim();
  if (!courseId || !identifier) {
    return NextResponse.json(
      { error: "courseId and email/phone required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Look up the student by email or phone.
  const isEmail = identifier.includes("@");
  const digits = identifier.replace(/\D/g, "");
  let query = admin.from("profiles").select("id, full_name, email, phone");
  query = isEmail
    ? query.ilike("email", identifier)
    : query.ilike("phone", `%${digits}%`);
  const { data: student, error: pErr } = await query.limit(1).maybeSingle();

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 400 });
  }
  if (!student) {
    return NextResponse.json(
      {
        error: `No account found for "${identifier}". Ask them to sign up first, then grant access.`,
      },
      { status: 404 }
    );
  }

  const { error: eErr } = await admin.from("enrollments").upsert(
    {
      student_id: student.id,
      course_id: courseId,
      is_free: true,
      payment_id: null,
    },
    { onConflict: "student_id,course_id" }
  );
  if (eErr) {
    return NextResponse.json({ error: eErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, student });
}

/** Revoke a person's access to a course. */
export async function DELETE(request: Request) {
  const supabase = await createClient();
  if (!(await requireStaff(supabase))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    courseId?: string;
    studentId?: string;
  };
  const courseId = body.courseId?.trim();
  const studentId = body.studentId?.trim();
  if (!courseId || !studentId) {
    return NextResponse.json(
      { error: "courseId and studentId required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  await admin
    .from("progress")
    .delete()
    .eq("course_id", courseId)
    .eq("student_id", studentId);
  const { error } = await admin
    .from("enrollments")
    .delete()
    .eq("course_id", courseId)
    .eq("student_id", studentId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
