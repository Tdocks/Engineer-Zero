import { NextResponse } from "next/server";
import { codingReviewerQueue } from "@/lib/coding-reviewer-workflow";

export async function GET(request: Request) {
  const result = await codingReviewerQueue(request.headers.get("authorization"));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ packets: result.packets });
}
