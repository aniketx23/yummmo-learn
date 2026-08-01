"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type GrantedStudent = {
  studentId: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export function ManageAccess({
  courseId,
  granted,
}: {
  courseId: string;
  granted: GrantedStudent[];
}) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function grant() {
    const value = identifier.trim();
    if (!value) {
      toast.error("Enter an email or phone number");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/admin/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, identifier: value }),
    });
    const j = (await r.json()) as { error?: string; student?: GrantedStudent };
    setBusy(false);
    if (!r.ok) {
      toast.error(j.error ?? "Could not grant access");
      return;
    }
    toast.success("Access granted");
    setIdentifier("");
    router.refresh();
  }

  async function revoke(studentId: string) {
    setRevoking(studentId);
    const r = await fetch("/api/admin/access", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentId }),
    });
    const j = (await r.json()) as { error?: string };
    setRevoking(null);
    if (!r.ok) {
      toast.error(j.error ?? "Could not revoke access");
      return;
    }
    toast.success("Access revoked");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grant access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Enter the student&apos;s email or phone. They must have signed up
            first. This gives them access to watch this cake tutorial.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="email or phone number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void grant();
              }}
            />
            <Button disabled={busy} onClick={() => void grant()}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Grant
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>People with access ({granted.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {granted.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No one has access yet
                    </TableCell>
                  </TableRow>
                ) : (
                  granted.map((s) => (
                    <TableRow key={s.studentId}>
                      <TableCell className="font-medium">
                        {s.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.email ?? "—"}
                      </TableCell>
                      <TableCell>{s.phone ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={revoking === s.studentId}
                          onClick={() => void revoke(s.studentId)}
                        >
                          {revoking === s.studentId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
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
