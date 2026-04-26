"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Unlink } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Identity = {
  id: string;
  provider: string;
  identity_id: string;
  identity_data?: Record<string, unknown>;
};

type Props = {
  identities: Identity[];
  userEmail: string;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function ConnectedAccounts({ identities, userEmail }: Props) {
  const router = useRouter();
  const hasGoogle = identities.some((i) => i.provider === "google");
  const hasEmail = identities.some((i) => i.provider === "email");
  const canUnlink = identities.length > 1;

  const googleIdentity = identities.find((i) => i.provider === "google");
  const googleEmail =
    (googleIdentity?.identity_data?.email as string) ?? userEmail;

  const [busy, setBusy] = useState<string | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);
  const [changeGoogleOpen, setChangeGoogleOpen] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  async function linkGoogle() {
    setBusy("link-google");
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });
    if (error) {
      setBusy(null);
      toast.error(error.message);
    }
  }

  async function unlinkProvider(provider: string) {
    const identity = identities.find((i) => i.provider === provider);
    if (!identity || !canUnlink) return;
    setBusy(`unlink-${provider}`);
    const supabase = createClient();
    const { error } = await supabase.auth.unlinkIdentity({
      id: identity.id,
      identity_id: identity.identity_id,
    } as Parameters<typeof supabase.auth.unlinkIdentity>[0]);
    setBusy(null);
    setUnlinkTarget(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account successfully unlink ho gaya!");
    router.refresh();
  }

  async function changeGoogle() {
    if (!googleIdentity || !canUnlink) return;
    setBusy("change-google");
    const supabase = createClient();
    const { error: unlinkErr } = await supabase.auth.unlinkIdentity({
      id: googleIdentity.id,
      identity_id: googleIdentity.identity_id,
    } as Parameters<typeof supabase.auth.unlinkIdentity>[0]);
    if (unlinkErr) {
      setBusy(null);
      setChangeGoogleOpen(false);
      toast.error(unlinkErr.message);
      return;
    }
    const { error: linkErr } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });
    if (linkErr) {
      setBusy(null);
      setChangeGoogleOpen(false);
      toast.error(linkErr.message);
    }
  }

  async function setPassword() {
    if (newPassword.length < 6) {
      toast.error("Password kam se kam 6 characters ka hona chahiye");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords match nahi kar rahe");
      return;
    }
    setBusy("set-password");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      "Password successfully set ho gaya! Ab email aur Google dono se login kar sakte ho."
    );
    setShowPasswordForm(false);
    setNewPassword("");
    setConfirmPassword("");
    router.refresh();
  }

  async function changeEmail() {
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast.error("Valid email daalo");
      return;
    }
    setBusy("change-email");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      "Verification email bhej diya! Naye email pe link click karo tab email change hoga."
    );
    setShowEmailForm(false);
    setNewEmail("");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ── Google ─────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <GoogleIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Google</p>
                <p className="truncate text-xs text-muted-foreground">
                  {hasGoogle ? googleEmail : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {hasGoogle ? (
                <>
                  {canUnlink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnlinkTarget("google")}
                      disabled={busy !== null}
                    >
                      <Unlink className="mr-1 h-3 w-3" />
                      Unlink
                    </Button>
                  )}
                  {!canUnlink && (
                    <p className="text-xs text-muted-foreground max-w-[140px]">
                      Password add karo pehle, phir unlink kar sakte ho
                    </p>
                  )}
                  {canUnlink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChangeGoogleOpen(true)}
                      disabled={busy !== null}
                    >
                      Change
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void linkGoogle()}
                  disabled={busy !== null}
                >
                  {busy === "link-google" && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  Connect Google
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Email & Password ───────────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Email & Password</p>
                <p className="truncate text-xs text-muted-foreground">
                  {hasEmail ? userEmail : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {hasEmail ? (
                <>
                  {canUnlink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnlinkTarget("email")}
                      disabled={busy !== null}
                    >
                      <Unlink className="mr-1 h-3 w-3" />
                      Unlink
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmailForm((v) => !v)}
                    disabled={busy !== null}
                  >
                    Change Email
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordForm((v) => !v)}
                  disabled={busy !== null}
                >
                  Add Password
                </Button>
              )}
            </div>
          </div>

          {/* ── Add Password form (Google-only users) ──────── */}
          {showPasswordForm && !hasEmail && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kam se kam 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Wahi password dobara"
                />
              </div>
              <Button
                size="sm"
                onClick={() => void setPassword()}
                disabled={busy === "set-password"}
              >
                {busy === "set-password" && (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                )}
                Password Set Karo
              </Button>
            </div>
          )}

          {/* ── Change Email form ──────────────────────────── */}
          {showEmailForm && hasEmail && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label>New email address</Label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newemail@example.com"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Verification email purane aur naye dono address pe jayega.
              </p>
              <Button
                size="sm"
                onClick={() => void changeEmail()}
                disabled={busy === "change-email"}
              >
                {busy === "change-email" && (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                )}
                Verification Email Bhejo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Unlink confirmation dialog ──────────────────────── */}
      <Dialog
        open={unlinkTarget !== null}
        onOpenChange={(v) => !v && setUnlinkTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {unlinkTarget === "google" ? "Google" : "Email & Password"} unlink
              karein?
            </DialogTitle>
            <DialogDescription>
              Kya aap sure hain?{" "}
              {unlinkTarget === "google" ? "Google" : "Email & Password"} se
              login nahi kar paoge iske baad.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy !== null}
              onClick={() => unlinkTarget && void unlinkProvider(unlinkTarget)}
            >
              {busy?.startsWith("unlink") && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              Unlink
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Change Google confirmation dialog ──────────────── */}
      <Dialog open={changeGoogleOpen} onOpenChange={setChangeGoogleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google account change karein?</DialogTitle>
            <DialogDescription>
              Ye aapka Google account change kar dega. Naya Google sign-in popup
              khulega jahan aap doosra account choose kar sakte ho.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangeGoogleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={busy !== null}
              onClick={() => void changeGoogle()}
            >
              {busy === "change-google" && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
