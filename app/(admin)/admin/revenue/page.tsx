import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/revenue-chart";

export default async function AdminRevenuePage() {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, created_at, course_id")
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const byMonth = new Map<string, number>();
  for (const p of payments ?? []) {
    const d = new Date(p.created_at);
    const key = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + parseFloat(String(p.amount)));
  }

  const chartData = [...byMonth.entries()].map(([month, total]) => ({
    month,
    total,
  }));

  const totalAll = (payments ?? []).reduce(
    (a, p) => a + parseFloat(String(p.amount)),
    0
  );

  const courseIds = [...new Set((payments ?? []).map((p) => p.course_id))];
  const { data: courses } = courseIds.length
    ? await supabase.from("courses").select("id, title").in("id", courseIds)
    : { data: [] as { id: string; title: string }[] };

  const titleBy = new Map((courses ?? []).map((c) => [c.id, c.title]));
  const byCourse = new Map<string, number>();
  for (const p of payments ?? []) {
    byCourse.set(
      p.course_id,
      (byCourse.get(p.course_id) ?? 0) + parseFloat(String(p.amount))
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Revenue</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              All-time
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {formatPrice(totalAll)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly (completed payments)</CardTitle>
        </CardHeader>
        <CardContent className={chartData.length > 0 ? "h-72" : ""}>
          {chartData.length > 0 ? (
            <RevenueChart data={chartData} />
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Abhi koi payment nahi hua. Pehla course sell hone ke baad yahan data dikhega.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {byCourse.size > 0 ? (
            [...byCourse.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([id, amt]) => (
                <div key={id} className="flex justify-between border-b py-2">
                  <span>{titleBy.get(id) ?? id}</span>
                  <span className="font-semibold">{formatPrice(amt)}</span>
                </div>
              ))
          ) : (
            <p className="py-6 text-center text-muted-foreground">
              Course-wise revenue tab dikhega jab pehli sale ho.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
