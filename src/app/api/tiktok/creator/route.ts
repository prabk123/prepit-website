import { NextResponse } from "next/server";
import { NOT_ALLOWED } from "@/lib/tiktok/publisher";
import { accessToken, allowedCreatorInfo } from "@/lib/tiktok/server";

/** The signed-in creator's name, avatar and posting options (TikTok's creator_info). */
export async function GET() {
  const token = await accessToken();
  if (!token) return NextResponse.json({ signedIn: false });
  try {
    const info = await allowedCreatorInfo(token);
    if (!info) return NextResponse.json({ signedIn: true, error: NOT_ALLOWED }, { status: 403 });
    return NextResponse.json({ signedIn: true, creator: info });
  } catch (e) {
    return NextResponse.json({ signedIn: true, error: (e as Error).message }, { status: 502 });
  }
}
