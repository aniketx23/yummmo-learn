import Link from "next/link";
import { KeyRound, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickGrant, type GrantCourse } from "@/components/admin/quick-grant";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, slug, is_published, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("enrollments").select("course_id"),
  ]);

  const list = courses ?? [];
  const accessBy = new Map<string, number>();
  for (const e of enrollments ?? []) {
    accessBy.set(e.course_id, (accessBy.get(e.course_id) ?? 0) + 1);
  }

  const grantCourses: GrantCourse[] = list.map((c) => ({
    id: c.id,
    title: c.title,
  }));
  const totalAccess = enrollments?.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {list.length} cake {list.length === 1 ? "tutorial" : "tutorials"} ·{" "}
            {totalAccess} {totalAccess === 1 ? "person has" : "people have"}{" "}
            access
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            New cake tutorial
          </Link>
        </Button>
      </div>

      {/* ── Grant access (primary daily action) ─────────────── */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Grant access
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Workshop attend karne wale student ko video ka access do. Unka
            account pehle bana hona chahiye.
          </p>
        </CardHeader>
        <CardContent>
          <QuickGrant courses={grantCourses} />
        </CardContent>
      </Card>

      {/* ── Cake tutorials ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your cake tutorials</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-cream p-8 text-center">
              <p className="text-muted-foreground">
                Abhi koi tutorial nahi hai.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/admin/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first one
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((c) => {
                const count = accessBy.get(c.id) ?? 0;
                return (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{c.title}</p>
                        {c.is_published ? (
                          <Badge variant="herb">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {count} {count === 1 ? "person has" : "people have"}{" "}
                        access
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/courses/${c.id}/access`}>
                          <KeyRound className="mr-2 h-3.5 w-3.5" />
                          Manage access
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/courses/${c.id}/edit`}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/courses/${c.slug}`} target="_blank">
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
