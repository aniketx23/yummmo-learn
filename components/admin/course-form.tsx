"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { getYouTubeId } from "@/lib/video";
import { createClient } from "@/lib/supabase/client";

type Resource = { type: "file" | "link"; name: string; url: string };

export type ExistingCourse = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  level: string;
  language: string;
  thumbnail_url: string;
  is_published: boolean;
  video_url: string;
  tips: string;
  recipe: Resource | null;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function CourseForm({
  categories,
  existingCourse,
}: {
  categories: { id: string; name: string; slug: string }[];
  existingCourse?: ExistingCourse;
}) {
  const isEdit = !!existingCourse;
  const router = useRouter();

  const [title, setTitle] = useState(existingCourse?.title ?? "");
  const [slug, setSlug] = useState(existingCourse?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(
    existingCourse?.short_description ?? ""
  );
  const [description, setDescription] = useState(
    existingCourse?.description ?? ""
  );
  const [categoryId, setCategoryId] = useState(existingCourse?.category_id ?? "");
  const [level, setLevel] = useState(existingCourse?.level ?? "Beginner");
  const [language, setLanguage] = useState(existingCourse?.language ?? "Hindi");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existingCourse?.thumbnail_url ?? ""
  );
  const [videoUrl, setVideoUrl] = useState(existingCourse?.video_url ?? "");
  const [tips, setTips] = useState(existingCourse?.tips ?? "");
  const [recipe, setRecipe] = useState<Resource | null>(
    existingCourse?.recipe ?? null
  );
  const [isPublished, setIsPublished] = useState(
    existingCourse?.is_published ?? false
  );
  const [busy, setBusy] = useState(false);

  const slugAuto = useMemo(() => slugify(title), [title]);
  const effectiveSlug = slug || slugAuto;
  const videoOk = !videoUrl.trim() || !!getYouTubeId(videoUrl.trim());

  async function uploadFile(file: File): Promise<string | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("course-thumbnails")
      .upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return null;
    }
    const { data } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(path);
    toast.success(`${file.name} uploaded`);
    return data.publicUrl;
  }

  async function uploadThumb(file: File) {
    const url = await uploadFile(file);
    if (url) setThumbnailUrl(url);
  }

  async function uploadRecipe(file: File) {
    const url = await uploadFile(file);
    if (url) setRecipe({ type: "file", name: file.name, url });
  }

  async function submit() {
    if (!title.trim()) {
      toast.error("Cake title is required");
      return;
    }
    if (videoUrl.trim() && !getYouTubeId(videoUrl.trim())) {
      toast.error("Enter a valid YouTube link (youtu.be/... or youtube.com/watch?v=...)");
      return;
    }
    setBusy(true);

    const body = {
      title: title.trim(),
      slug: effectiveSlug.trim(),
      short_description: shortDescription || null,
      description: description || null,
      category_id: categoryId || null,
      level,
      language,
      is_free: false,
      price: 0,
      original_price: null,
      thumbnail_url: thumbnailUrl || null,
      tags: null,
      is_published: isPublished,
      resources: [],
      sections: [
        {
          title: "Tutorial",
          lessons: [
            {
              title: title.trim() || "Full Tutorial",
              description: description || null,
              is_free_preview: false,
              video_bunny_id: null,
              video_url: videoUrl.trim() || null,
              tips: tips || null,
              attachments: recipe ? [recipe] : [],
            },
          ],
        },
      ],
    };

    const url = isEdit
      ? `/api/admin/courses/${existingCourse.id}`
      : "/api/admin/courses";
    const method = isEdit ? "PUT" : "POST";

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = (await r.json()) as { id?: string; error?: string };
    setBusy(false);
    if (!r.ok) {
      toast.error(j.error ?? "Failed to save cake");
      return;
    }

    if (isEdit) {
      toast.success("Cake updated!");
      router.refresh();
    } else {
      toast.success("Cake created!");
      router.push(`/admin/courses/${j.id}/edit`);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cake details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cake name</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tutifruti Dry Cake"
            />
          </div>
          <div className="space-y-2">
            <Label>URL slug</Label>
            <Input
              value={slug || slugAuto}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="auto-generated from name"
            />
            <p className="text-xs text-muted-foreground">
              URL: /courses/{effectiveSlug || "..."}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Short description</Label>
            <Input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One line (shown on cards)"
            />
          </div>
          <div className="space-y-2">
            <Label>Full description</Label>
            <Textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this tutorial covers, healthy swaps used, etc."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                className={selectClass}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <select
                className={selectClass}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <select
                className={selectClass}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>Hindi</option>
                <option>Hinglish</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>YouTube link (unlisted)</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/XXXXXXXX"
            />
            {!videoOk && (
              <p className="text-xs text-destructive">
                That doesn&apos;t look like a YouTube link.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Upload the cake video to YouTube as <b>Unlisted</b>, then paste the
              share link here. Leave blank if not uploaded yet.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Thumbnail image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadThumb(f);
              }}
            />
            <Input
              placeholder="Or paste a public image URL"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
            />
            {thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="h-32 w-auto rounded-md object-cover"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recipe &amp; tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chef tips (optional)</Label>
            <Textarea
              rows={3}
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="Ek healthy swap ya baking trick jo students ke kaam aaye..."
            />
          </div>
          <div className="space-y-2">
            <Label>Recipe PDF (optional)</Label>
            {recipe ? (
              <div className="flex items-center gap-2 rounded border bg-background px-3 py-2 text-sm">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href={recipe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-primary hover:underline"
                >
                  {recipe.name}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setRecipe(null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadRecipe(f);
                }}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Only students with access can download this on the watch page.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publish</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Publish (visible on the catalog — still locked until you grant access)
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" disabled={busy} onClick={() => void submit()}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {busy ? "Saving…" : isEdit ? "Update cake" : "Save cake"}
        </Button>
      </div>
    </div>
  );
}
