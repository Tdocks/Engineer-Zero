import { NextResponse } from "next/server";
import { reviewCodingBoardResponse } from "@/lib/coding-review-board";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { reviewerId?: unknown; response?: unknown };
    if (typeof body.reviewerId !== "string" || typeof body.response !== "string") return NextResponse.json({ error: "A reviewer and response are required." }, { status: 400 });
    if (body.response.length > 24_000) return NextResponse.json({ error: "This review response exceeds the permitted size." }, { status: 413 });
    const result = reviewCodingBoardResponse(body.reviewerId, body.response);
    if (!result) return NextResponse.json({ error: "That reviewer is not available." }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "The review response could not be scored. Your draft remains available." }, { status: 400 });
  }
}
