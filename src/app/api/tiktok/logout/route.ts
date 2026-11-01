import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/tiktok/publisher";

/** Signs the publisher page out of TikTok. */
export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/tiktok-publisher", request.nextUrl.origin), 303);
  res.cookies.delete(TOKEN_COOKIE);
  return res;
}
