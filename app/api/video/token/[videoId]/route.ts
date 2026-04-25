import { NextResponse } from "next/server";
import { embedIframeUrl } from "@/lib/bunny";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const token = process.env.BUNNY_TOKEN_AUTH_KEY || undefined;
  const url = embedIframeUrl(videoId, token);
  return NextResponse.json({ url });
}
