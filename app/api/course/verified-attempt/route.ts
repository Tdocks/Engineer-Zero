import { NextResponse } from "next/server";
import { createVerifiedCourseAttempt, type VerifiedCourseAttemptInput } from "@/lib/course-attempt-verification";
import type { StructuredEvidence } from "@/lib/course-types";

const allowedTracks = new Set(["applied-ai-operations", "it-support-technician"]);
const allowedKinds = new Set(["module", "lab", "mission"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<VerifiedCourseAttemptInput> | null;
  if (
    !body?.trackId ||
    !allowedTracks.has(body.trackId) ||
    !body.kind ||
    !allowedKinds.has(body.kind) ||
    !body.itemId ||
    !body.evidence ||
    JSON.stringify(body.evidence).length > 12_000
  ) {
    return NextResponse.json({ error: "Provide one known course activity and bounded structured evidence." }, { status: 400 });
  }
  const result = await createVerifiedCourseAttempt(request.headers.get("authorization"), {
    trackId: body.trackId as VerifiedCourseAttemptInput["trackId"],
    kind: body.kind as VerifiedCourseAttemptInput["kind"],
    itemId: body.itemId,
    answers: body.answers ?? {},
    evidence: body.evidence as StructuredEvidence,
    missionChoices: body.missionChoices ?? {},
    revisionOf: body.revisionOf,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.graded, { status: result.status });
}
