import { NextResponse } from "next/server";

import { aioBaseline, gradeAioBaseline, shuffledAioBaseline } from "@/lib/aio-baseline";
import {
  gradeItSupportBaseline,
  itSupportBaseline,
  shuffledItSupportBaseline,
} from "@/lib/it-support-baseline";

const assessments = {
  "applied-ai-operations": {
    version: "aio-baseline-v2",
    total: aioBaseline.length,
    shuffled: shuffledAioBaseline,
    grade: gradeAioBaseline,
  },
  "it-support-technician": {
    version: "it-support-baseline-v2",
    total: itSupportBaseline.length,
    shuffled: shuffledItSupportBaseline,
    grade: gradeItSupportBaseline,
  },
} as const;

function resolveTrack(track: string) {
  return assessments[track as keyof typeof assessments];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ track: string }> },
) {
  const { track } = await params;
  const assessment = resolveTrack(track);
  if (!assessment)
    return NextResponse.json({ error: "No baseline is available for that track." }, { status: 404 });
  const seed = new URL(request.url).searchParams.get("attempt") ?? crypto.randomUUID();
  return NextResponse.json({
    version: assessment.version,
    total: assessment.total,
    questions: assessment.shuffled(seed),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ track: string }> },
) {
  const { track } = await params;
  const assessment = resolveTrack(track);
  if (!assessment)
    return NextResponse.json({ error: "No baseline is available for that track." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as {
    answers?: Record<string, string>;
  } | null;
  if (!body?.answers)
    return NextResponse.json({ error: "Submit selected answer IDs." }, { status: 400 });
  const result = assessment.grade(body.answers);
  if (!result.complete)
    return NextResponse.json(
      { error: "Answer every baseline question before creating a plan.", ...result },
      { status: 400 },
    );
  return NextResponse.json({ ...result, version: assessment.version });
}
