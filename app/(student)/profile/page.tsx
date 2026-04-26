import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const isComplete = sp.complete === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      {isComplete && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="font-display text-lg font-semibold text-primary">
            Welcome to Yummmo Learn!
          </p>
          <p className="text-sm text-muted-foreground">
            Please add your phone number to complete your profile.
          </p>
        </div>
      )}
      <h1 className="mb-6 font-display text-3xl font-bold">Your profile</h1>
      <ProfileForm
        initial={{
          full_name: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
          avatar_url: profile?.avatar_url ?? "",
        }}
        redirectTo={isComplete ? "/dashboard" : undefined}
      />
    </div>
  );
}
