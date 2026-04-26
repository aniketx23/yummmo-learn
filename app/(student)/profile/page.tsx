import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { ConnectedAccounts } from "@/components/connected-accounts";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const isComplete = sp.complete === "1";
  const emailUpdated = sp.email_updated === "1";

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

  const identities = (user.identities ?? []).map((i) => ({
    id: i.id,
    provider: i.provider,
    identity_id: i.identity_id,
    identity_data: i.identity_data as Record<string, unknown> | undefined,
  }));

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      {isComplete && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="font-display text-lg font-semibold text-primary">
            Welcome to Yummmo Learn!
          </p>
          <p className="text-sm text-muted-foreground">
            Please add your phone number to complete your profile.
          </p>
        </div>
      )}
      {emailUpdated && (
        <div className="rounded-xl border border-herb/30 bg-herb/5 p-4 text-center">
          <p className="font-display text-lg font-semibold text-herb">
            Email successfully update ho gaya!
          </p>
        </div>
      )}
      <h1 className="font-display text-3xl font-bold">Your profile</h1>
      <ProfileForm
        initial={{
          full_name: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
          avatar_url: profile?.avatar_url ?? "",
        }}
        redirectTo={isComplete ? "/dashboard" : undefined}
      />
      <ConnectedAccounts
        identities={identities}
        userEmail={user.email ?? ""}
      />
    </div>
  );
}
