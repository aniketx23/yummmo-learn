import { createClient } from "@/lib/supabase/server";
import { LiveClassesAdmin } from "@/components/admin/live-classes-admin";

export default async function AdminLiveClassesPage() {
  const supabase = await createClient();

  const [{ data: classes }, { data: registrations }] = await Promise.all([
    supabase
      .from("live_classes")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("live_class_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Live Classes</h1>
      <LiveClassesAdmin
        initialClasses={(classes ?? []) as never[]}
        initialRegistrations={(registrations ?? []) as never[]}
      />
    </div>
  );
}
