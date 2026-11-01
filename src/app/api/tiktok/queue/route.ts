import { NextResponse } from "next/server";
import { QUEUE_URL } from "@/lib/tiktok/publisher";
import { accessToken, allowedCreatorInfo } from "@/lib/tiktok/server";

/** The reels ready to post, for the signed-in PrepIt account only. */
export async function GET() {
  const token = await accessToken();
  if (!token) return NextResponse.json([], { status: 401 });
  try {
    if (!(await allowedCreatorInfo(token))) return NextResponse.json([], { status: 403 });
    const res = await fetch(QUEUE_URL, { cache: "no-store" });
    const q = res.ok ? await res.json() : [];
    return NextResponse.json(Array.isArray(q) ? q : []);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
