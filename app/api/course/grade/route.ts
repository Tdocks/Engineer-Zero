import { NextResponse } from "next/server";
import { gradeCourseAttempt, type CourseItemKind } from "@/lib/aio-grade";
import type { StructuredEvidence } from "@/lib/course-types";

const recentRequests = new Map<string, number[]>();
const windowMs = 60_000;
const maxRequestsPerWindow = 18;

export async function POST(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (recentRequests.get(client) ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= maxRequestsPerWindow)
    return NextResponse.json({ error: "Too many practice scoring requests. Keep revising locally and retry in a minute." }, { status: 429 });
  recent.push(now);
  recentRequests.set(client, recent);
  const body = (await request.json().catch(() => null)) as {
    kind?: CourseItemKind;
    itemId?: string;
    answers?: Record<string, string>;
    evidence?: StructuredEvidence;
    missionChoices?: Record<string, string>;
  } | null;
  if (
    !body?.kind ||
    !body.itemId ||
    !body.evidence ||
    JSON.stringify(body.evidence).length > 12000
  ) {
    return NextResponse.json(
      {
        error: "Provide a known course item and all structured evidence fields under 12,000 characters.",
      },
      { status: 400 },
    );
  }
  if (!["module", "lab", "mission"].includes(body.kind)) {
    return NextResponse.json(
      { error: "Unknown course item kind." },
      { status: 400 },
    );
  }
  const result = gradeCourseAttempt({
    kind: body.kind,
    itemId: body.itemId,
    answers: body.answers ?? {},
    evidence: body.evidence,
    missionChoices: body.missionChoices ?? {},
  });
  if (!result)
    return NextResponse.json(
      { error: "Course item not found." },
      { status: 404 },
    );
  return NextResponse.json(result);
}
