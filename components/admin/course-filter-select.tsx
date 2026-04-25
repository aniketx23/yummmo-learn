"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CourseFilterSelect({
  courses,
}: {
  courses: { id: string; title: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("course") ?? "";

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) {
          params.set("course", e.target.value);
        } else {
          params.delete("course");
        }
        router.push(`/admin/enrollments?${params.toString()}`);
      }}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
    >
      <option value="">All courses</option>
      {courses.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title}
        </option>
      ))}
    </select>
  );
}
