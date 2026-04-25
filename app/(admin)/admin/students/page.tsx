import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id, full_name, phone, created_at, role")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: students } = await query;

  const ids = (students ?? []).map((s) => s.id);
  const { data: counts } = ids.length
    ? await supabase
        .from("enrollments")
        .select("student_id")
        .in("student_id", ids)
    : { data: [] as { student_id: string }[] };

  const countBy = new Map<string, number>();
  for (const r of counts ?? []) {
    countBy.set(r.student_id, (countBy.get(r.student_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Students</h1>
      <form className="max-w-sm">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name or phone..."
        />
      </form>
      <div className="overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(students ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {q ? "No students found" : "No students yet"}
                </TableCell>
              </TableRow>
            ) : (
              (students ?? []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {s.full_name ?? "—"}
                  </TableCell>
                  <TableCell>{s.phone ?? "—"}</TableCell>
                  <TableCell>{countBy.get(s.id) ?? 0}</TableCell>
                  <TableCell>
                    {formatDate(s.created_at)}
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
