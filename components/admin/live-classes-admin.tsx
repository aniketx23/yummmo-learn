"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Loader2,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

type LiveClass = {
  id: string;
  title: string;
  description: string | null;
  schedule_type: string;
  schedule_days: string | null;
  time_slot: string | null;
  max_spots: number;
  price: string | number;
  is_active: boolean;
  created_at: string;
};

type Registration = {
  id: string;
  live_class_id: string | null;
  student_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  age: number | null;
  gender: string | null;
  preferred_date: string | null;
  preferred_slot: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

const statusColors: Record<string, string> = {
  pending: "secondary",
  confirmed: "herb",
  cancelled: "destructive",
  completed: "default",
};

export function LiveClassesAdmin({
  initialClasses,
  initialRegistrations,
}: {
  initialClasses: LiveClass[];
  initialRegistrations: Registration[];
}) {
  const router = useRouter();
  const [classes] = useState(initialClasses);
  const [registrations] = useState(initialRegistrations);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // Stats
  const totalRegs = registrations.length;
  const pendingRegs = registrations.filter((r) => r.status === "pending").length;
  const confirmedRegs = registrations.filter((r) => r.status === "confirmed").length;
  const activeClasses = classes.filter((c) => c.is_active).length;

  // Filtered registrations
  const filteredRegs = registrations.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (classFilter && r.live_class_id !== classFilter) return false;
    return true;
  });

  // Class name lookup
  const classNames = new Map(classes.map((c) => [c.id, c.title]));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{activeClasses}</p>
            <p className="text-xs text-muted-foreground">Active Batches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalRegs}</p>
            <p className="text-xs text-muted-foreground">Total Registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{pendingRegs}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-herb">{confirmedRegs}</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="batches">
        <TabsList>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="registrations">
            Registrations ({totalRegs})
          </TabsTrigger>
        </TabsList>

        {/* ── Batches Tab ──────────────────────────────────────── */}
        <TabsContent value="batches" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Batch
            </Button>
          </div>

          {classes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No batches created yet. Click &quot;New Batch&quot; to add one.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {classes.map((cls) => {
                const regCount = registrations.filter(
                  (r) => r.live_class_id === cls.id
                ).length;
                return (
                  <Card
                    key={cls.id}
                    className={!cls.is_active ? "opacity-60" : ""}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-lg">{cls.title}</CardTitle>
                        <Badge
                          variant={cls.is_active ? "herb" : "secondary"}
                          className="mt-1"
                        >
                          {cls.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <BatchActions cls={cls} onRefresh={() => router.refresh()} />
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      {cls.description && (
                        <p className="text-charcoal/70">{cls.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4">
                        {cls.schedule_days && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {cls.schedule_days}
                          </span>
                        )}
                        {cls.time_slot && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {cls.time_slot}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {regCount}/{cls.max_spots} spots
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Registrations Tab ────────────────────────────────── */}
        <TabsContent value="registrations" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass + " max-w-[180px]"}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className={selectClass + " max-w-[220px]"}
            >
              <option value="">All batches</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No registrations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegs.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">
                        {reg.full_name}
                        {reg.age && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({reg.age}y, {reg.gender ?? "—"})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{reg.phone}</TableCell>
                      <TableCell className="text-xs">
                        {reg.live_class_id
                          ? classNames.get(reg.live_class_id) ?? "—"
                          : "General"}
                      </TableCell>
                      <TableCell>
                        {reg.preferred_date
                          ? formatDate(reg.preferred_date)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {reg.preferred_slot ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (statusColors[reg.status] as
                              | "secondary"
                              | "destructive"
                              | "default"
                              | "herb") ?? "secondary"
                          }
                        >
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <RegistrationActions
                          regId={reg.id}
                          currentStatus={reg.status}
                          onRefresh={() => router.refresh()}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Create Batch Dialog ────────────────────────────────── */}
      <CreateBatchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}

// ── Batch Actions Dropdown ──────────────────────────────────────────
function BatchActions({
  cls,
  onRefresh,
}: {
  cls: LiveClass;
  onRefresh: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch(`/api/admin/live-classes/${cls.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !cls.is_active }),
    });
    setBusy(false);
    toast.success(cls.is_active ? "Batch deactivated" : "Batch activated");
    onRefresh();
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/live-classes/${cls.id}`, { method: "DELETE" });
    setBusy(false);
    toast.success("Batch deleted");
    onRefresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => void toggle()}>
          {cls.is_active ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => void remove()}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Registration Status Actions ─────────────────────────────────────
function RegistrationActions({
  regId,
  currentStatus,
  onRefresh,
}: {
  regId: string;
  currentStatus: string;
  onRefresh: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: string) {
    setBusy(true);
    await fetch(`/api/admin/live-class-registrations/${regId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    toast.success(`Status changed to ${status}`);
    onRefresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currentStatus !== "confirmed" && (
          <DropdownMenuItem onClick={() => void updateStatus("confirmed")}>
            Confirm
          </DropdownMenuItem>
        )}
        {currentStatus !== "completed" && (
          <DropdownMenuItem onClick={() => void updateStatus("completed")}>
            Mark Completed
          </DropdownMenuItem>
        )}
        {currentStatus !== "cancelled" && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => void updateStatus("cancelled")}
          >
            Cancel
          </DropdownMenuItem>
        )}
        {currentStatus !== "pending" && (
          <DropdownMenuItem onClick={() => void updateStatus("pending")}>
            Reset to Pending
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Create Batch Dialog ─────────────────────────────────────────────
function CreateBatchDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleType, setScheduleType] = useState("weekend");
  const [scheduleDays, setScheduleDays] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [maxSpots, setMaxSpots] = useState("8");
  const [price, setPrice] = useState("0");

  async function create() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/admin/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description || null,
        schedule_type: scheduleType,
        schedule_days: scheduleDays || null,
        time_slot: timeSlot || null,
        max_spots: parseInt(maxSpots) || 8,
        price: parseFloat(price) || 0,
      }),
    });
    setBusy(false);
    if (r.ok) {
      toast.success("Batch created!");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setScheduleDays("");
      setTimeSlot("");
      onCreated();
    } else {
      const j = (await r.json()) as { error?: string };
      toast.error(j.error ?? "Failed to create");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Batch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Batch title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Baking Batch"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this batch?"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Schedule type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
              >
                <option value="weekend">Weekend</option>
                <option value="weekday">Weekday</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Days</Label>
              <Input
                value={scheduleDays}
                onChange={(e) => setScheduleDays(e.target.value)}
                placeholder="e.g. Saturday & Sunday"
              />
            </div>
            <div className="space-y-2">
              <Label>Time slot</Label>
              <Input
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 10:00 AM - 1:00 PM"
              />
            </div>
            <div className="space-y-2">
              <Label>Max spots</Label>
              <Input
                type="number"
                value={maxSpots}
                onChange={(e) => setMaxSpots(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Price (INR, 0 = free)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void create()} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
