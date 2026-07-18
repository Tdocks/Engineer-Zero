import { NextResponse } from "next/server";
import { reviewCodingInterview } from "@/lib/coding-interviews";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { promptId?: unknown; response?: unknown };
    if (typeof body.promptId !== "string" || typeof body.response !== "string") return NextResponse.json({ error: "An interview prompt and response are required." }, { status: 400 });
    if (body.response.length > 24_000) return NextResponse.json({ error: "This interview response exceeds the permitted size." }, { status: 413 });
    const result = reviewCodingInterview(body.promptId, body.response);
    if (!result) return NextResponse.json({ error: "That interview prompt is not available." }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "The interview response could not be reviewed. Your draft remains available." }, { status: 400 });
  }
}
