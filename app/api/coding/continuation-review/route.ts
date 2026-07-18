import { NextResponse } from "next/server";
import { reviewCodingContinuation } from "@/lib/coding-continuation-rubric";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { moduleId?: unknown; submission?: Record<string, unknown> } | null;
  const fields = ["artifact", "verification", "limitation", "nextDecision"] as const;
  if (typeof body?.moduleId !== "string" || !body.submission || !fields.every((field) => typeof body.submission?.[field] === "string" && body.submission[field].length <= 6000)) {
    return NextResponse.json({ error: "Provide bounded evidence for each continuation section." }, { status: 400 });
  }
  const result = reviewCodingContinuation(body.moduleId, {
    artifact: body.submission.artifact as string,
    verification: body.submission.verification as string,
    limitation: body.submission.limitation as string,
    nextDecision: body.submission.nextDecision as string,
  });
  if (!result) return NextResponse.json({ error: "That continuation module is unavailable." }, { status: 404 });
  return NextResponse.json(result);
}
