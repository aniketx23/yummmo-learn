"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MarkLessonComplete({
  lessonId,
  courseId,
  initiallyCompleted,
  nextLessonUrl,
}: {
  lessonId: string;
  courseId: string;
  initiallyCompleted?: boolean;
  nextLessonUrl?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initiallyCompleted ?? false);

  async function mark() {
    setLoading(true);
    const r = await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, courseId }),
    });
    setLoading(false);
    if (r.ok) {
      setDone(true);
      toast.success("Lesson completed!");
      router.refresh();
    } else {
      toast.error("Failed to mark complete");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant={done ? "outline" : "secondary"}
        disabled={loading || done}
        onClick={() => void mark()}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {done ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Completed
          </>
        ) : (
          "Mark lesson complete"
        )}
      </Button>
      {done && nextLessonUrl && (
        <Button asChild>
          <Link href={nextLessonUrl}>Next lesson →</Link>
        </Button>
      )}
    </div>
  );
}
