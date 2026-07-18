import { NextResponse } from "next/server";
import { codingModelStrategyScenario, type ModelStrategyId } from "@/lib/coding-model-strategy";
import { reviewCodingModelStrategy } from "@/lib/coding-model-strategy-rubric";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { strategy?: unknown; rationale?: unknown };
    const validStrategies = new Set<string>(codingModelStrategyScenario.options.map((option) => option.id));
    if (typeof body.strategy !== "string" || !validStrategies.has(body.strategy) || typeof body.rationale !== "string") return NextResponse.json({ error: "Choose a strategy and provide a concrete rationale." }, { status: 400 });
    return NextResponse.json(reviewCodingModelStrategy(body.strategy as ModelStrategyId, body.rationale));
  } catch {
    return NextResponse.json({ error: "The model-strategy decision could not be reviewed. Keep your work and retry." }, { status: 400 });
  }
}
