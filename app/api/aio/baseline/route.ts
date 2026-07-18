import { NextResponse } from "next/server";
import { aioBaseline, gradeAioBaseline, shuffledAioBaseline } from "@/lib/aio-baseline";

export async function GET(request: Request) {
  const seed = new URL(request.url).searchParams.get("attempt") ?? crypto.randomUUID();
  return NextResponse.json({
    version: "aio-baseline-v2",
    total: aioBaseline.length,
    questions: shuffledAioBaseline(seed),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    answers?: Record<string, string>;
  } | null;
  if (!body?.answers)
    return NextResponse.json({ error: "Submit selected answer IDs." }, { status: 400 });
  const result = gradeAioBaseline(body.answers);
  if (!result.complete)
    return NextResponse.json(
      { error: "Answer every baseline question before creating a plan.", ...result },
      { status: 400 },
    );
  return NextResponse.json(result);
}
