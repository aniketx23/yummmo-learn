import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrollmentsExport } from "@/components/admin/enrollments-export";
import { CourseFilterSelect } from "@/components/admin/course-filter-select";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const courseFilter =
    typeof sp.course === "string" ? sp.course.trim() : "";

  const supabase = await createClient();

  let enrollQuery = supabase
    .from("enrollments")
    .select("enrolled_at, student_id, course_id, is_free, payment_id")
    .order("enrolled_at", { ascending: false })
    .limit(200);

  if (courseFilter) {
    enrollQuery = enrollQuery.eq("course_id", courseFilter);
  }

  const { data: rowsRaw } = await enrollQuery;

  type EnrollRow = {
    enrolled_at: string;
    student_id: string;
    course_id: string;
    is_free: boolean;
    payment_id: string | null;
  };
  const rows = (rowsRaw ?? []) as EnrollRow[];

  const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));
  const courseIds = Array.from(new Set(rows.map((r) => r.course_id)));
  const paymentIds = rows
    .map((r) => r.payment_id)
    .filter(Boolean) as string[];

  // Fetch all courses for the filter dropdown (not just those in results)
  const [{ data: profs }, { data: crs }, { data: pays }, { data: allCourses }] =
    await Promise.all([
      studentIds.length
        ? supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", studentIds)
        : Promise.resolve({
            data: [] as { id: string; full_name: string | null; email: string | null }[],
          }),
      courseIds.length
        ? supabase.from("courses").select("id, title").in("id", courseIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
      paymentIds.length
        ? supabase
            .from("payments")
            .select("id, amount, razorpay_payment_id")
            .in("id", paymentIds)
        : Promise.resolve({
            data: [] as {
              id: string;
              amount: string;
              razorpay_payment_id: string | null;
            }[],
          }),
      supabase
        .from("courses")
        .select("id, title")
        .order("title"),
    ]);

  const profRows = (profs ?? []) as { id: string; full_name: string | null; email: string | null }[];
  const courseRows = (crs ?? []) as { id: string; title: string }[];
  const payRows = (pays ?? []) as {
    id: string;
    amount: string;
    razorpay_payment_id: string | null;
  }[];

  const nameBy = new Map(profRows.map((p) => [p.id, p.full_name]));
  const emailBy = new Map(profRows.map((p) => [p.id, p.email]));
  const titleBy = new Map(courseRows.map((c) => [c.id, c.title]));
  const payBy = new Map(payRows.map((p) => [p.id, p]));

  const table = rows.map((r) => {
    const pay = r.payment_id ? payBy.get(r.payment_id) : undefined;
    return {
      ...r,
      student: nameBy.get(r.student_id) ?? "",
      email: emailBy.get(r.student_id) ?? "",
      course: titleBy.get(r.course_id) ?? "",
      amount: pay?.amount ?? null,
      payId: pay?.razorpay_payment_id ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Enrollments</h1>
        <EnrollmentsExport rows={table} />
      </div>
      <div className="max-w-xs">
        <CourseFilterSelect courses={(allCourses ?? []) as { id: string; title: string }[]} />
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No enrollments yet
                </TableCell>
              </TableRow>
            ) : (
              table.map((r) => (
                <TableRow key={r.student_id + r.course_id + r.enrolled_at}>
                  <TableCell>{r.student}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email || "—"}</TableCell>
                  <TableCell>{r.course}</TableCell>
                  <TableCell>
                    {formatDate(r.enrolled_at)}
                  </TableCell>
                  <TableCell>
                    {r.is_free
                      ? "Free"
                      : r.amount != null
                        ? formatPrice(parseFloat(String(r.amount)))
                        : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.payId ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
