import { NextRequest, NextResponse } from "next/server";
import { directPostBody, NOT_ALLOWED, postRequestError, type PostRequest } from "@/lib/tiktok/publisher";
import { accessToken, allowedCreatorInfo, tiktokPost } from "@/lib/tiktok/server";

/** Posts one reel to the signed-in creator's TikTok (Direct Post, TikTok fetches the video). */
export async function POST(request: NextRequest) {
  const token = await accessToken();
  if (!token) return NextResponse.json({ error: "Sign in with TikTok first." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as Partial<PostRequest>;
  try {
    const info = await allowedCreatorInfo(token);
    if (!info) return NextResponse.json({ error: NOT_ALLOWED }, { status: 403 });
    const problem = postRequestError(body, info.privacy_level_options);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    const r = body as PostRequest;
    const data = await tiktokPost<{ publish_id: string }>("/post/publish/video/init/", token, directPostBody({
      ...r,
      disableComment: r.disableComment || info.comment_disabled,
      disableDuet: r.disableDuet || info.duet_disabled,
      disableStitch: r.disableStitch || info.stitch_disabled,
    }));
    return NextResponse.json({ publishId: data.publish_id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
