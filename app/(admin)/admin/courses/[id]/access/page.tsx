import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ManageAccess, type GrantedStudent } from "@/components/admin/manage-access";

export default async function CourseAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: course } = await admin
    .from("courses")
    .select("id, title, slug")
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();

  const { data: enrollments } = await admin
    .from("enrollments")
    .select("student_id, enrolled_at")
    .eq("course_id", id)
    .order("enrolled_at", { ascending: false });

  const ids = (enrollments ?? []).map((e) => e.student_id).filter(Boolean);
  const { data: profiles } = ids.length
    ? await admin
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", ids)
    : { data: [] as { id: string; full_name: string | null; email: string | null; phone: string | null }[] };

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  const granted: GrantedStudent[] = (enrollments ?? [])
    .map((e) => {
      const p = byId.get(e.student_id);
      return p
        ? {
            studentId: p.id,
            full_name: p.full_name,
            email: p.email,
            phone: p.phone,
          }
        : null;
    })
    .filter((x): x is GrantedStudent => x !== null);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/courses"
          className="text-sm text-primary hover:underline"
        >
          ← Back to courses
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold">Manage access</h1>
        <p className="text-muted-foreground">{course.title}</p>
      </div>
      <ManageAccess courseId={course.id} granted={granted} />
    </div>
  );
}
