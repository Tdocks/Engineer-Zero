import { NextResponse } from "next/server";
import { codingTestReviewCases, type TestReviewDisposition } from "@/lib/coding-test-review";
import { reviewCodingTests } from "@/lib/coding-test-review-rubric";

const allowed = new Set(["no-behavior", "wrong-requirement", "flaky-dependency", "implementation-coupling", "missing-boundary"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { choices?: unknown };
    if (!body.choices || typeof body.choices !== "object" || Array.isArray(body.choices)) return NextResponse.json({ error: "Classify each fictional test before requesting feedback." }, { status: 400 });
    const knownIds = new Set<string>(codingTestReviewCases.map((item) => item.id));
    const choices = Object.entries(body.choices as Record<string, unknown>).reduce<Partial<Record<string, TestReviewDisposition>>>((result, [id, value]) => {
      if (knownIds.has(id) && typeof value === "string" && allowed.has(value)) result[id] = value as TestReviewDisposition;
      return result;
    }, {});
    return NextResponse.json(reviewCodingTests(choices));
  } catch {
    return NextResponse.json({ error: "The test-review choices could not be scored. Your selections remain available locally." }, { status: 400 });
  }
}
