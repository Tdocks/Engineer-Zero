import { NextResponse } from "next/server";
import type { CourseItemKind } from "@/lib/aio-grade";
import type { StructuredEvidence } from "@/lib/course-types";
import { createVerifiedCourseAttempt } from "@/lib/course-attempt-verification";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    kind?: CourseItemKind;
    itemId?: string;
    answers?: Record<string, string>;
    evidence?: StructuredEvidence;
    missionChoices?: Record<string, string>;
    revisionOf?: string;
  } | null;
  if (!body?.kind || !body.itemId || !body.evidence || !["module", "lab", "mission"].includes(body.kind)) {
    return NextResponse.json({ error: "Provide a valid AIO activity and complete structured evidence." }, { status: 400 });
  }
  const result = await createVerifiedCourseAttempt(request.headers.get("authorization"), {
    trackId: "applied-ai-operations",
    kind: body.kind,
    itemId: body.itemId,
    answers: body.answers ?? {},
    evidence: body.evidence,
    missionChoices: body.missionChoices ?? {},
    revisionOf: body.revisionOf,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.graded, { status: result.status });
}
