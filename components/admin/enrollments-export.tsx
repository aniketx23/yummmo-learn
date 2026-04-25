"use client";

import { Button } from "@/components/ui/button";

type Row = {
  student: string;
  course: string;
  enrolled_at: string;
  is_free: boolean;
  amount: string | null;
  payId: string | null | undefined;
};

export function EnrollmentsExport({ rows }: { rows: Row[] }) {
  function csv() {
    const header = ["Student", "Course", "Date", "Free", "Amount", "PaymentId"];
    const lines = rows.map((r) =>
      [
        JSON.stringify(r.student),
        JSON.stringify(r.course),
        r.enrolled_at,
        r.is_free ? "yes" : "no",
        r.amount ?? "",
        r.payId ?? "",
      ].join(",")
    );
    return [header.join(","), ...lines].join("\n");
  }

  function download() {
    const blob = new Blob([csv()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" onClick={download}>
      Export CSV
    </Button>
  );
}
