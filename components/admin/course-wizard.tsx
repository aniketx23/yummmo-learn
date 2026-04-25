"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Resource = { type: "file" | "link"; name: string; url: string };

type Lesson = {
  title: string;
  description: string;
  is_free_preview: boolean;
  video_bunny_id: string;
  video_url: string;
  tips: string;
  attachments: Resource[];
};

type Section = { title: string; lessons: Lesson[] };

type ExistingCourse = {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string;
  level: string;
  language: string;
  tags: string;
  is_free: boolean;
  price: string;
  original_price: string;
  thumbnail_url: string;
  is_published: boolean;
  sections: Section[];
  resources: Resource[];
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

function emptyLesson(): Lesson {
  return {
    title: "New lesson",
    description: "",
    is_free_preview: false,
    video_bunny_id: "",
    video_url: "",
    tips: "",
    attachments: [],
  };
}

function updateLesson(
  setSections: React.Dispatch<React.SetStateAction<Section[]>>,
  si: number,
  li: number,
  patch: Partial<Lesson>
) {
  setSections((s) =>
    s.map((x, i) =>
      i === si
        ? {
            ...x,
            lessons: x.lessons.map((y, j) =>
              j === li ? { ...y, ...patch } : y
            ),
          }
        : x
    )
  );
}

// ── Resource list editor (reused for course-level and lesson-level) ──
function ResourceEditor({
  resources,
  onChange,
  onUpload,
  label,
}: {
  resources: Resource[];
  onChange: (r: Resource[]) => void;
  onUpload: (file: File) => Promise<string | null>;
  label: string;
}) {
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [fileTitle, setFileTitle] = useState("");

  function addLink() {
    if (!linkUrl.trim()) return;
    if (!linkName.trim()) {
      toast.error("Please enter a title for the link");
      return;
    }
    onChange([
      ...resources,
      { type: "link", name: linkName.trim(), url: linkUrl.trim() },
    ]);
    setLinkName("");
    setLinkUrl("");
  }

  async function handleFile(file: File) {
    const title = fileTitle.trim() || file.name;
    const url = await onUpload(file);
    if (url) {
      onChange([...resources, { type: "file", name: title, url }]);
      setFileTitle("");
    }
  }

  function remove(i: number) {
    onChange(resources.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {resources.length > 0 && (
        <div className="space-y-1">
          {resources.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded border bg-background px-2 py-1.5 text-xs"
            >
              {r.type === "file" ? (
                <FileText className="h-3 w-3 shrink-0 text-primary" />
              ) : (
                <ExternalLink className="h-3 w-3 shrink-0 text-primary" />
              )}
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-primary hover:underline"
              >
                {r.name}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Upload a file</p>
        <div className="flex gap-2">
          <Input
            placeholder="Title (e.g. Recipe PDF)"
            value={fileTitle}
            onChange={(e) => setFileTitle(e.target.value)}
            className="text-xs"
          />
          <Input
            type="file"
            className="text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </div>
      </div>
      <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Add a link</p>
        <div className="flex gap-2">
          <Input
            placeholder="Title (e.g. YouTube Tutorial)"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            className="text-xs"
          />
          <Input
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 text-xs"
          />
          <Button type="button" variant="outline" size="sm" onClick={addLink}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CourseWizard({
  categories,
  existingCourse,
}: {
  categories: { id: string; name: string; slug: string }[];
  existingCourse?: ExistingCourse;
}) {
  const isEdit = !!existingCourse;
  const router = useRouter();
  const [title, setTitle] = useState(existingCourse?.title ?? "");
  const [shortDescription, setShortDescription] = useState(
    existingCourse?.short_description ?? ""
  );
  const [description, setDescription] = useState(
    existingCourse?.description ?? ""
  );
  const [categoryId, setCategoryId] = useState(
    existingCourse?.category_id ?? ""
  );
  const [level, setLevel] = useState(existingCourse?.level ?? "Beginner");
  const [language, setLanguage] = useState(existingCourse?.language ?? "Hindi");
  const [tags, setTags] = useState(existingCourse?.tags ?? "");
  const [isFree, setIsFree] = useState(existingCourse?.is_free ?? false);
  const [price, setPrice] = useState(existingCourse?.price ?? "499");
  const [originalPrice, setOriginalPrice] = useState(
    existingCourse?.original_price ?? ""
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existingCourse?.thumbnail_url ?? ""
  );
  const [slug, setSlug] = useState(existingCourse?.slug ?? "");
  const [isPublished, setIsPublished] = useState(
    existingCourse?.is_published ?? false
  );
  const [seoTitle, setSeoTitle] = useState(
    (existingCourse as Record<string, unknown>)?.seo_title as string ?? ""
  );
  const [seoDescription, setSeoDescription] = useState(
    (existingCourse as Record<string, unknown>)?.seo_description as string ?? ""
  );
  const [resources, setResources] = useState<Resource[]>(
    existingCourse?.resources ?? []
  );
  const [sections, setSections] = useState<Section[]>(
    existingCourse?.sections?.length
      ? existingCourse.sections
      : [
          {
            title: "Section 1",
            lessons: [{ ...emptyLesson(), title: "Lesson 1", is_free_preview: true }],
          },
        ]
  );
  const [busy, setBusy] = useState(false);

  const slugAuto = useMemo(() => slugify(title), [title]);
  const effectiveSlug = slug || slugAuto;

  // ── Upload helper ───────────────────────────────────────────
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

  // ── Section/lesson helpers ──────────────────────────────────
  function addSection() {
    setSections((s) => [
      ...s,
      {
        title: `Section ${s.length + 1}`,
        lessons: [emptyLesson()],
      },
    ]);
  }

  function removeSection(i: number) {
    setSections((s) => s.filter((_, idx) => idx !== i));
  }

  function addLesson(si: number) {
    setSections((s) =>
      s.map((sec, idx) =>
        idx === si ? { ...sec, lessons: [...sec.lessons, emptyLesson()] } : sec
      )
    );
  }

  function removeLesson(si: number, li: number) {
    setSections((s) =>
      s.map((sec, idx) =>
        idx === si
          ? { ...sec, lessons: sec.lessons.filter((_, j) => j !== li) }
          : sec
      )
    );
  }

  // ── Submit ──────────────────────────────────────────────────
  async function submit() {
    if (!title.trim()) {
      toast.error("Course title is required");
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
      tags: tags
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : null,
      is_free: isFree,
      price: isFree ? 0 : parseFloat(price || "0"),
      original_price:
        originalPrice.trim() === "" ? null : parseFloat(originalPrice),
      thumbnail_url: thumbnailUrl || null,
      is_published: isPublished,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      resources,
      sections: sections.map((s) => ({
        title: s.title,
        lessons: s.lessons.map((l) => ({
          title: l.title,
          description: l.description || null,
          is_free_preview: l.is_free_preview,
          video_bunny_id: l.video_bunny_id || null,
          video_url: l.video_url || null,
          tips: l.tips || null,
          attachments: l.attachments.length ? l.attachments : null,
        })),
      })),
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
      toast.error(j.error ?? "Failed to save course");
      return;
    }

    if (isEdit) {
      toast.success("Course updated!");
      router.refresh();
    } else {
      toast.success("Course created!");
      router.push(`/admin/courses/${j.id}/edit`);
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Tabs defaultValue="info">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Course info</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        {/* ── Info tab ─────────────────────────────────────────────── */}
        <TabsContent value="info" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Course title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Atta Cake Masterclass" />
              </div>
              <div className="space-y-2">
                <Label>URL slug</Label>
                <Input
                  value={slug || slugAuto}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="auto-generated from title"
                />
                <p className="text-xs text-muted-foreground">URL: /courses/{effectiveSlug || "..."}</p>
              </div>
              <div className="space-y-2">
                <Label>Short description</Label>
                <Input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="One line about the course (shown on cards)" />
              </div>
              <div className="space-y-2">
                <Label>Full description</Label>
                <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of what students will learn" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select className={selectClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">— Select category —</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <select className={selectClass} value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option>Hindi</option><option>Hinglish</option><option>English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. baking, sugar-free, atta" />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input id="free" type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
                <Label htmlFor="free">Free course</Label>
              </div>
              {!isFree && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Price (INR)</Label>
                    <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="499" />
                  </div>
                  <div className="space-y-2">
                    <Label>Original price</Label>
                    <Input value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="Optional — shows as strikethrough" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Thumbnail image</Label>
                <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadThumb(f); }} />
                <Input placeholder="Or paste a public image URL" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
                {thumbnailUrl && <img src={thumbnailUrl} alt="Thumbnail preview" className="h-32 w-auto rounded-md object-cover" />}
              </div>
            </CardContent>
          </Card>

          {/* ── Course-level resources ──────────────────────────────── */}
          <Card>
            <CardHeader><CardTitle>Course Resources</CardTitle></CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">
                Attach files (PDFs, recipes) or reference links that apply to the whole course. Students see these on the course page.
              </p>
              <ResourceEditor
                resources={resources}
                onChange={setResources}
                onUpload={uploadFile}
                label="Files & links"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Curriculum tab ───────────────────────────────────────── */}
        <TabsContent value="curriculum" className="space-y-4 pt-4">
          <div className="flex justify-between">
            <h2 className="font-display text-xl font-bold">Sections & lessons</h2>
            <Button type="button" variant="outline" size="sm" onClick={addSection}>
              <Plus className="h-4 w-4" /> Add section
            </Button>
          </div>
          {sections.map((sec, si) => (
            <Card key={si}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <Input
                  value={sec.title}
                  onChange={(e) => setSections((s) => s.map((x, i) => i === si ? { ...x, title: e.target.value } : x))}
                  className="max-w-md font-semibold"
                  placeholder="Section name"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSection(si)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {sec.lessons.map((les, li) => (
                  <div key={li} className="space-y-3 rounded-lg border bg-muted/30 p-3">
                    {/* Title row */}
                    <div className="flex justify-between gap-2">
                      <Input
                        value={les.title}
                        onChange={(e) => updateLesson(setSections, si, li, { title: e.target.value })}
                        placeholder="Lesson name"
                      />
                      <label className="flex shrink-0 items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={les.is_free_preview}
                          onChange={(e) => updateLesson(setSections, si, li, { is_free_preview: e.target.checked })}
                        />
                        Free preview
                      </label>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeLesson(si, li)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Description */}
                    <Textarea
                      rows={2}
                      placeholder="Lesson description (optional)"
                      value={les.description}
                      onChange={(e) => updateLesson(setSections, si, li, { description: e.target.value })}
                    />

                    {/* Video ID */}
                    <div className="space-y-1">
                      <Input
                        placeholder="Video ID (paste after uploading to Bunny.net)"
                        value={les.video_bunny_id}
                        onChange={(e) => updateLesson(setSections, si, li, { video_bunny_id: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">Leave blank if video not yet uploaded</p>
                    </div>

                    {/* Video URL (YouTube fallback) */}
                    <div className="space-y-1">
                      <Input
                        placeholder="Video URL (e.g. https://youtu.be/...)"
                        value={les.video_url}
                        onChange={(e) => updateLesson(setSections, si, li, { video_url: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">YouTube link paste karein (jab tak Bunny.net setup na ho)</p>
                    </div>

                    {/* Chef Tips */}
                    <div className="space-y-1">
                      <Label className="text-xs">Chef Tips (optional)</Label>
                      <Textarea
                        rows={2}
                        placeholder="Share a cooking tip, recipe note, or trick for this lesson..."
                        value={les.tips}
                        onChange={(e) => updateLesson(setSections, si, li, { tips: e.target.value })}
                      />
                    </div>

                    {/* Lesson attachments */}
                    <ResourceEditor
                      resources={les.attachments}
                      onChange={(att) => updateLesson(setSections, si, li, { attachments: att })}
                      onUpload={uploadFile}
                      label="Lesson files & links"
                    />
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => addLesson(si)}>
                  <Plus className="h-4 w-4" /> Add lesson
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Publish tab ──────────────────────────────────────────── */}
        <TabsContent value="publish" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle>SEO & Preview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Course URL</Label>
                <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                  learn.yummmo.com/courses/{effectiveSlug || "..."}
                </p>
              </div>
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "Defaults to course title"}
                />
                <p className="text-xs text-muted-foreground">Shows in search engine results. Leave blank to use course title.</p>
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))}
                  placeholder="Brief description for search engines (max 160 characters)"
                />
                <p className="text-xs text-muted-foreground">{seoDescription.length}/160 characters</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Go live</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                Publish course (visible on catalog)
              </label>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button type="button" disabled={busy} onClick={() => void submit()}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {busy ? "Saving…" : isEdit ? "Update course" : "Save course"}
        </Button>
      </div>
    </div>
  );
}
