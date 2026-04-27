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
import { createClient } from "@/lib/supabase/client";

type LiveClass = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  schedule_type: string;
  schedule_days: string | null;
  time_slot: string | null;
  class_date: string | null;
  start_time: string | null;
  end_time: string | null;
  max_spots: number;
  price: string | number;
  is_active: boolean;
  location: string | null;
  location_city: string | null;
  thumbnail_url: string | null;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<LiveClass | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  function openCreate() {
    setEditingBatch(null);
    setDialogOpen(true);
  }

  function openEdit(cls: LiveClass) {
    setEditingBatch(cls);
    setDialogOpen(true);
  }

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

  // Class lookup maps
  const classNames = new Map(classes.map((c) => [c.id, c.title]));
  const classById = new Map(classes.map((c) => [c.id, c]));

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
            <Button onClick={openCreate}>
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
                      <BatchActions
                        cls={cls}
                        onEdit={() => openEdit(cls)}
                        onRefresh={() => router.refresh()}
                      />
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      {cls.description && (
                        <p className="text-charcoal/70">{cls.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4">
                        {cls.class_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(cls.class_date)}
                          </span>
                        )}
                        {(cls.start_time || cls.time_slot) && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {cls.start_time && cls.end_time
                              ? `${cls.start_time} - ${cls.end_time}`
                              : cls.time_slot}
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
                          : reg.live_class_id && classById.get(reg.live_class_id)?.class_date
                            ? formatDate(classById.get(reg.live_class_id)!.class_date!)
                            : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {reg.preferred_slot
                          ?? (reg.live_class_id && classById.get(reg.live_class_id)?.start_time
                            ? `${classById.get(reg.live_class_id)!.start_time} - ${classById.get(reg.live_class_id)!.end_time}`
                            : "—")}
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

      {/* ── Create / Edit Batch Dialog ─────────────────────────── */}
      <BatchDialog
        key={editingBatch?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditingBatch(null);
        }}
        existingBatch={editingBatch}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}

// ── Batch Actions Dropdown ──────────────────────────────────────────
function BatchActions({
  cls,
  onEdit,
  onRefresh,
}: {
  cls: LiveClass;
  onEdit: () => void;
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
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
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

// ── Time Picker Helper ──────────────────────────────────────────────
function TimePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const parts = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) ?? [];
  const hour = parts[1] ?? "10";
  const minute = parts[2] ?? "00";
  const period = parts[3] ?? "AM";

  function update(h: string, m: string, p: string) {
    onChange(`${h}:${m} ${p}`);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          value={hour}
          onChange={(e) => update(e.target.value, minute, period)}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={String(h)}>{h}</option>
          ))}
        </select>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          value={minute}
          onChange={(e) => update(hour, e.target.value, period)}
        >
          <option value="00">00</option>
          <option value="30">30</option>
        </select>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
          value={period}
          onChange={(e) => update(hour, minute, e.target.value)}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

// ── Batch Dialog (create + edit) ────────────────────────────────────
function BatchDialog({
  open,
  onOpenChange,
  existingBatch,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingBatch: LiveClass | null;
  onSaved: () => void;
}) {
  const isEdit = !!existingBatch;
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState(existingBatch?.title ?? "");
  const [slug, setSlug] = useState(existingBatch?.slug ?? "");
  const [description, setDescription] = useState(existingBatch?.description ?? "");
  const [classDate, setClassDate] = useState(existingBatch?.class_date ?? "");
  const [startTime, setStartTime] = useState(existingBatch?.start_time ?? "10:00 AM");
  const [endTime, setEndTime] = useState(existingBatch?.end_time ?? "1:00 PM");
  const [maxSpots, setMaxSpots] = useState(String(existingBatch?.max_spots ?? 8));
  const [price, setPrice] = useState(String(existingBatch?.price ?? 0));
  const [location, setLocation] = useState(existingBatch?.location ?? "");
  const [locationCity, setLocationCity] = useState(existingBatch?.location_city ?? "Noida");
  const [thumbnailUrl, setThumbnailUrl] = useState(existingBatch?.thumbnail_url ?? "");
  const [uploading, setUploading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function uploadPoster(file: File) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in again to upload");
      return;
    }
    setUploading(true);
    const path = `${user.id}/batch-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("course-thumbnails")
      .upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(path);
    setThumbnailUrl(data.publicUrl);
    setUploading(false);
    toast.success("Poster uploaded");
  }

  async function save() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!classDate) {
      toast.error("Please select a date");
      return;
    }
    setBusy(true);
    const body = {
      title: title.trim(),
      slug: slug.trim() || null,
      description: description || null,
      class_date: classDate,
      start_time: startTime,
      end_time: endTime,
      location: location || null,
      location_city: locationCity || null,
      thumbnail_url: thumbnailUrl || null,
      max_spots: parseInt(maxSpots) || 8,
      price: parseFloat(price) || 0,
    };
    const r = await fetch(
      isEdit ? `/api/admin/live-classes/${existingBatch!.id}` : "/api/admin/live-classes",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    setBusy(false);
    if (r.ok) {
      toast.success(isEdit ? "Batch updated!" : "Batch created!");
      onOpenChange(false);
      onSaved();
    } else {
      const j = (await r.json()) as { error?: string };
      toast.error(j.error ?? "Failed to save");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Batch" : "Create New Batch"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Batch title</Label>
            <Input
              value={title}
              onChange={(e) => {
                const v = e.target.value;
                setTitle(v);
                if (!slug) {
                  setSlug(
                    v
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .trim()
                      .replace(/\s+/g, "-")
                  );
                }
              }}
              placeholder="e.g. Dry Cake Baking Batch"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              URL Slug
              <span className="ml-1 text-xs text-muted-foreground">
                (optional — for shareable link)
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-muted-foreground">
                /live-classes/
              </span>
              <Input
                placeholder="haridwar-cake-class"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-")
                  )
                }
              />
            </div>
            {slug && (
              <p className="text-xs text-green-600">
                ✓ yummmo-learn.vercel.app/live-classes/{slug}
              </p>
            )}
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

          {/* City / Location */}
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              placeholder="e.g. Noida"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Full Address / Venue
              <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. B2 1602, Cleo County, Sector 121, Noida"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Class date</Label>
            <Input
              type="date"
              value={classDate}
              min={today}
              onChange={(e) => setClassDate(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TimePicker label="Start time" value={startTime} onChange={setStartTime} />
            <TimePicker label="End time" value={endTime} onChange={setEndTime} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Max spots</Label>
              <Input
                type="number"
                inputMode="numeric"
                className="no-spinner"
                value={maxSpots}
                onChange={(e) => setMaxSpots(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Price (INR, 0 = free)</Label>
              <Input
                type="number"
                inputMode="numeric"
                className="no-spinner"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Batch Poster — file upload */}
          <div className="space-y-1.5">
            <Label>
              Batch Poster
              <span className="ml-1 text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadPoster(f);
              }}
            />
            {uploading && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
              </p>
            )}
            {thumbnailUrl && !uploading && (
              <div className="relative mt-2 h-32 w-full overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl}
                  alt="Poster preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setThumbnailUrl("")}
                  className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Batch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
