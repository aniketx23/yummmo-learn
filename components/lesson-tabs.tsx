"use client";

import { ExternalLink, FileText, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Resource = { type: string; name: string; url: string };

export function LessonTabs({
  description,
  tips,
  attachments,
}: {
  description: string | null;
  tips: string | null;
  attachments: Resource[];
}) {
  const hasRefs = attachments.length > 0;

  return (
    <Tabs defaultValue="lesson">
      <TabsList>
        <TabsTrigger value="lesson">Lesson</TabsTrigger>
        {hasRefs && <TabsTrigger value="references">References</TabsTrigger>}
      </TabsList>

      <TabsContent value="lesson" className="space-y-6 pt-4">
        {description && (
          <p className="whitespace-pre-wrap text-muted-foreground">
            {description}
          </p>
        )}

        {tips && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2 font-display font-semibold text-primary">
              <Lightbulb className="h-4 w-4" />
              Chef&apos;s Tip
            </div>
            <p className="whitespace-pre-wrap text-sm text-charcoal/80">
              {tips}
            </p>
          </div>
        )}
      </TabsContent>

      {hasRefs && (
        <TabsContent value="references" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Files and links shared by the instructor for this lesson.
          </p>
          <div className="space-y-3">
            {attachments.map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border bg-white p-4 transition hover:bg-muted"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {att.type === "file" ? (
                    <FileText className="h-5 w-5 text-primary" />
                  ) : (
                    <ExternalLink className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{att.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {att.type === "file" ? "Download file" : att.url}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
