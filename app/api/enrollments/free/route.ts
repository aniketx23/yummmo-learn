import { NextResponse } from "next/server";

/**
 * Self-enrollment is disabled. Access to a course is granted by an admin
 * to workshop attendees (see /api/admin/access). This endpoint remains only
 * to return a clear response to any stale client calls.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Self-enrollment is disabled. Access is granted by the Yummmo team." },
    { status: 403 }
  );
}
