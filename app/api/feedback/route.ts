import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=== STRENGTHPATH FEEDBACK ===");
    console.log(JSON.stringify({
      reaction: body.reaction,
      comment: body.comment,
      topRole: body.topRole,
      trackTitle: body.trackTitle,
      timestamp: body.timestamp,
    }, null, 2));
    console.log("=============================");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
