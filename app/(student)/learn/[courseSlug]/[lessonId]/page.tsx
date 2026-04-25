import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BunnyVideoPlayer } from "@/components/bunny-video-player";
import { YouTubePlayer } from "@/components/youtube-player";
import { LessonProgressTracker } from "@/components/lesson-progress-tracker";
import { MarkLessonComplete } from "@/components/mark-lesson-complete";
import { getYouTubeId } from "@/lib/video";
import { LessonTabs } from "@/components/lesson-tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollapsibleSidebar } from "@/components/collapsible-sidebar";

type Resource = { type: string; name: string; url: string };

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug, is_published")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", course.id)
    .eq("student_id", user.id)
    .maybeSingle();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!lesson) notFound();

  if (!lesson.is_free_preview && !enrollment) {
    redirect(`/courses/${courseSlug}`);
  }

  const { data: sections } = await supabase
    .from("sections")
    .select("id, title, display_order")
    .eq("course_id", course.id)
    .order("display_order", { ascending: true });

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, section_id, display_order, is_free_preview, video_bunny_id")
    .eq("course_id", course.id)
    .order("display_order", { ascending: true });

  const { data: progress } = await supabase
    .from("progress")
    .select("lesson_id, is_completed")
    .eq("student_id", user.id)
    .eq("course_id", course.id);

  const done = new Set(
    (progress ?? []).filter((p) => p.is_completed).map((p) => p.lesson_id)
  );

  const flatLessons = (lessons ?? []).slice().sort((a, b) => {
    const sa = sections?.find((s) => s.id === a.section_id)?.display_order ?? 0;
    const sb = sections?.find((s) => s.id === b.section_id)?.display_order ?? 0;
    if (sa !== sb) return sa - sb;
    return a.display_order - b.display_order;
  });

  const idx = flatLessons.findIndex((l) => l.id === lessonId);
  const prev = idx > 0 ? flatLessons[idx - 1] : null;
  const next = idx >= 0 && idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null;

  const total = flatLessons.length;
  const completedCount = flatLessons.filter((l) => done.has(l.id)).length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;

  const isLocked = (l: (typeof flatLessons)[0]) =>
    !l.is_free_preview && !enrollment;

  const prevAccessible = prev && !isLocked(prev);
  const nextAccessible = next && !isLocked(next);

  // Whether the current lesson has a native video (for progress tracker)
  const hasNativeVideo = !!(lesson.video_url && !getYouTubeId(lesson.video_url));

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-cream lg:flex-row">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-full border-b bg-white lg:w-80 lg:border-b-0 lg:border-r">
        <div className="border-b p-4">
          <Link
            href={`/courses/${courseSlug}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            ← Back to course
          </Link>
          <h2 className="mt-2 font-display text-lg font-bold leading-snug">
            {course.title}
          </h2>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {completedCount}/{total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        <CollapsibleSidebar title="Curriculum">
        <ScrollArea className="h-[40vh] lg:h-[calc(100vh-12rem)]">
          <div className="space-y-4 p-3">
            {(sections ?? []).map((section) => (
              <div key={section.id}>
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {(lessons ?? [])
                    .filter((l) => l.section_id === section.id)
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((l) => {
                      const isActive = l.id === lessonId;
                      const locked = isLocked(l);
                      const isComplete = done.has(l.id);

                      {/* C9: completion indicators */}
                      const icon = isComplete ? (
                        <Check className="h-4 w-4 shrink-0 text-herb" />
                      ) : isActive ? (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                      ) : locked ? (
                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      );

                      const row = (
                        <>
                          {icon}
                          <span className="line-clamp-2">{l.title}</span>
                        </>
                      );

                      return (
                        <li key={l.id}>
                          {locked ? (
                            <span className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm opacity-50">
                              {row}
                            </span>
                          ) : (
                            <Link
                              href={`/learn/${courseSlug}/${l.id}`}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted",
                                isActive && "bg-primary/10 font-medium text-primary"
                              )}
                            >
                              {row}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
        </CollapsibleSidebar>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* C6: Previous/Next with clear disabled styling */}
        <div className="border-b bg-white px-4 py-3">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Lesson {idx + 1} of {total}
            </p>
            <div className="flex gap-2">
              {prevAccessible ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/learn/${courseSlug}/${prev.id}`}>Previous</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  Previous
                </Button>
              )}
              {nextAccessible ? (
                <Button size="sm" asChild>
                  <Link href={`/learn/${courseSlug}/${next.id}`}>Next</Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8">
          {/* ── Video player ─────────────────────────────────── */}
          {lesson.video_bunny_id ? (
            <BunnyVideoPlayer videoId={lesson.video_bunny_id} />
          ) : lesson.video_url && getYouTubeId(lesson.video_url) ? (
            <YouTubePlayer url={lesson.video_url} />
          ) : lesson.video_url ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#0f0f0f]">
              <video
                src={lesson.video_url}
                controls
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-cream text-center">
              <p className="text-lg font-medium text-primary">
                Video bahut jaldi aane wala hai! 🎬
              </p>
            </div>
          )}

          {/* Native video progress tracker */}
          {hasNativeVideo && (
            <LessonProgressTracker
              lessonId={lesson.id}
              courseId={course.id}
              durationSeconds={lesson.video_duration_seconds || 0}
            />
          )}

          {/* C8: Mark complete moved below video, above title */}
          <MarkLessonComplete
            lessonId={lesson.id}
            courseId={course.id}
            initiallyCompleted={done.has(lesson.id)}
            nextLessonUrl={nextAccessible ? `/learn/${courseSlug}/${next.id}` : undefined}
          />

          <h1 className="font-display text-2xl font-bold">{lesson.title}</h1>

          {/* C7: Description, Chef Tips, and Attachments via LessonTabs */}
          <LessonTabs
            description={lesson.description ?? null}
            tips={lesson.tips ?? null}
            attachments={(lesson.attachments as Resource[]) ?? []}
          />
        </div>
      </div>
    </div>
  );
}
