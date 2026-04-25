import Link from "next/link";
import { BookOpen, Plus, Receipt, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: courseCount },
    { count: studentCount },
    { count: enrollmentCount },
    paymentsRes,
    recentRes,
  ] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    supabase.from("enrollments").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("amount").eq("status", "completed"),
    supabase
      .from("enrollments")
      .select("enrolled_at, student_id, course_id")
      .order("enrolled_at", { ascending: false })
      .limit(8),
  ]);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: monthPayments } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "completed")
    .gte("created_at", monthStart.toISOString());

  const sum = (rows: { amount: string | number }[] | null) =>
    (rows ?? []).reduce((acc, r) => acc + parseFloat(String(r.amount)), 0);

  const revenueMonth = sum(monthPayments);
  const revenueAll = sum(paymentsRes.data ?? []);

  const recent = recentRes.data ?? [];
  const studentIds = [...new Set(recent.map((r) => r.student_id))];
  const courseIds = [...new Set(recent.map((r) => r.course_id))];
  const [{ data: profs }, { data: crs }] = await Promise.all([
    studentIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", studentIds)
      : Promise.resolve({
          data: [] as { id: string; full_name: string | null }[],
        }),
    courseIds.length
      ? supabase.from("courses").select("id, title").in("id", courseIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);
  const nameBy = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
  const titleBy = new Map((crs ?? []).map((c) => [c.id, c.title]));

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {courseCount ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {studentCount ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {enrollmentCount ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue (this month)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {formatPrice(revenueMonth)}
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        All-time revenue:{" "}
        <span className="font-semibold text-foreground">
          {formatPrice(revenueAll)}
        </span>
      </p>

      {/* ── Quick actions ──────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Button variant="outline" className="h-auto py-4" asChild>
          <Link href="/admin/courses/new" className="flex flex-col items-center gap-1">
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">New Course</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4" asChild>
          <Link href="/admin/students" className="flex flex-col items-center gap-1">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">View Students</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-4" asChild>
          <Link href="/admin/enrollments" className="flex flex-col items-center gap-1">
            <Receipt className="h-5 w-5" />
            <span className="text-sm font-medium">View Enrollments</span>
          </Link>
        </Button>
      </div>

      {/* ── Recent enrollments ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Recent enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[400px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      No enrollments yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((row) => (
                    <TableRow key={`${row.student_id}-${row.course_id}`}>
                      <TableCell>
                        {nameBy.get(row.student_id) ?? "—"}
                      </TableCell>
                      <TableCell>
                        {titleBy.get(row.course_id) ?? "—"}
                      </TableCell>
                      <TableCell>
                        {formatDate(row.enrolled_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
