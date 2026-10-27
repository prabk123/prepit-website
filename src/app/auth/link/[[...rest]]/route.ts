import { NextResponse } from "next/server";

/**
 * Old sign-in emails link here with `?mode=signIn&oobCode=…&apiKey=…`.
 * Email-link sign-in is gone (PRE-378), so send the visitor home with the
 * query dropped, before any page or analytics script can see the code.
 */
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url));
}
