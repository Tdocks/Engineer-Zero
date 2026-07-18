import { NextResponse } from "next/server";
import { reviewCodingChallenge } from "@/lib/coding-challenge-review";

const maxCodeLength = 60_000;
const maxExplanationLength = 20_000;

export async function POST(request: Request) {
  try {
    const body = await request.json() as { challengeId?: unknown; code?: unknown; explanation?: unknown };
    if (typeof body.challengeId !== "string" || typeof body.code !== "string" || typeof body.explanation !== "string") {
      return NextResponse.json({ error: "A challenge ID, code draft, and explanation are required." }, { status: 400 });
    }
    if (body.code.length > maxCodeLength || body.explanation.length > maxExplanationLength) {
      return NextResponse.json({ error: "This study submission exceeds the permitted size." }, { status: 413 });
    }
    const result = reviewCodingChallenge(body.challengeId, body.code, body.explanation);
    if (!result) return NextResponse.json({ error: "That coding exercise is not available for review." }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "The design review could not be completed. Your local draft remains unchanged." }, { status: 400 });
  }
}
