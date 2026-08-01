import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDurationMinutes } from "@/lib/utils";
import { Clock, PlayCircle } from "lucide-react";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  thumbnail_url: string | null;
  price?: string | number;
  original_price?: string | number | null;
  is_free?: boolean;
  total_lessons: number;
  total_duration_minutes: number;
  instructor?: { full_name: string | null } | null;
};

export function CourseCard({
  course,
  enrolled,
}: {
  course: CourseCardData;
  enrolled?: boolean;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/80 transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg hover:shadow-orange-100">
      <Link href={`/courses/${course.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-herb/20">
              <PlayCircle className="h-12 w-12 text-primary" />
            </div>
          )}
          {enrolled && (
            <Badge className="absolute left-3 top-3" variant="herb">
              Enrolled
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/courses/${course.slug}`}>
            <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
              {course.title}
            </h3>
          </Link>
        </div>
        {course.short_description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.short_description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" />
            {course.total_lessons <= 1
              ? "Video tutorial"
              : `${course.total_lessons} lessons`}
          </span>
          {course.total_duration_minutes > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDurationMinutes(course.total_duration_minutes)}
            </span>
          )}
        </div>
        {course.instructor?.full_name && (
          <p className="text-xs text-muted-foreground">
            Instructor:{" "}
            <span className="font-medium text-foreground">
              {course.instructor.full_name}
            </span>
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/30 px-5 py-4">
        <span className="font-display text-sm font-bold text-herb">
          {enrolled ? "Enrolled" : "Workshop tutorial"}
        </span>
        <Link
          href={enrolled ? `/learn/${course.slug}` : `/courses/${course.slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {enrolled ? "Watch now" : "View"}
        </Link>
      </CardFooter>
    </Card>
  );
}
