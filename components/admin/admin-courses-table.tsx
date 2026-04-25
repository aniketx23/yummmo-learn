"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { AdminCourseActions } from "@/components/admin/admin-course-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  is_free: boolean;
  price: string;
  categoryName: string;
};

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-36";

export function AdminCoursesTable({ courses }: { courses: CourseRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  const filtered = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (status === "published" && !c.is_published) return false;
    if (status === "draft" && c.is_published) return false;
    if (priceFilter === "free" && !c.is_free) return false;
    if (priceFilter === "paid" && c.is_free) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:flex-1"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClass}
        >
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">Free & Paid</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No courses match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const price =
                  typeof c.price === "string" ? parseFloat(c.price) : c.price;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.categoryName}</TableCell>
                    <TableCell>
                      {c.is_published ? (
                        <Badge variant="herb">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.is_free ? "Free" : formatPrice(price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminCourseActions
                        courseId={c.id}
                        slug={c.slug}
                        isPublished={c.is_published}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
