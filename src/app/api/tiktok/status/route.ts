import { NextRequest, NextResponse } from "next/server";
import { accessToken, tiktokPost } from "@/lib/tiktok/server";

/** Where a post is: processing, posted, or failed (TikTok's publish status). */
export async function POST(request: NextRequest) {
  const token = await accessToken();
  if (!token) return NextResponse.json({ error: "Sign in with TikTok first." }, { status: 401 });
  const { publishId } = await request.json().catch(() => ({}));
  if (typeof publishId !== "string" || !publishId) return NextResponse.json({ error: "No post to check." }, { status: 400 });
  try {
    const data = await tiktokPost<{ status: string; fail_reason?: string }>("/post/publish/status/fetch/", token, { publish_id: publishId });
    return NextResponse.json({ status: data.status, failReason: data.fail_reason || null });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
