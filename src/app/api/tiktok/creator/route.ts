import { NextResponse } from "next/server";
import type { CreatorInfo } from "@/lib/tiktok/publisher";
import { accessToken, tiktokPost } from "@/lib/tiktok/server";


/** The signed-in creator's name, avatar and posting options (TikTok's creator_info). */
export async function GET() {
  const token = await accessToken();
  if (!token) return NextResponse.json({ signedIn: false });
  try {
    const info = await tiktokPost<CreatorInfo>("/post/publish/creator_info/query/", token, {});
    return NextResponse.json({ signedIn: true, creator: info });
  } catch (e) {
    return NextResponse.json({ signedIn: true, error: (e as Error).message }, { status: 502 });
  }
}
