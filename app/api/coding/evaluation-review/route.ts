import { NextResponse } from "next/server";
import { reviewCodingEvaluation } from "@/lib/coding-evaluation-rubric";
import type { EvaluationDisposition } from "@/lib/coding-evaluation";

const validDispositions = new Set<EvaluationDisposition>(["accept", "escalate", "reject"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { choices?: Record<string, unknown> } | null;
  if (!body?.choices || typeof body.choices !== "object") {
    return NextResponse.json({ error: "Provide one disposition for each fictional evaluation case." }, { status: 400 });
  }
  const choices = Object.entries(body.choices).reduce<Partial<Record<string, EvaluationDisposition>>>((accepted, [id, value]) => {
    if (typeof value === "string" && validDispositions.has(value as EvaluationDisposition)) {
      accepted[id] = value as EvaluationDisposition;
    }
    return accepted;
  }, {});
  return NextResponse.json(reviewCodingEvaluation(choices));
}
