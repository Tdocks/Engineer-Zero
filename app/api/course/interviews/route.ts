import { NextResponse } from "next/server";
import { aioInterviewPrompts } from "@/lib/aio-content";

function publicPrompt(prompt: (typeof aioInterviewPrompts)[number]) {
  return {
    id: prompt.id,
    category: prompt.category,
    prompt: prompt.prompt,
    why: prompt.why,
  };
}

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

export async function GET() {
  return NextResponse.json({
    version: "aio-v1-draft",
    prompts: aioInterviewPrompts.map(publicPrompt),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    promptId?: string;
    response?: string;
  } | null;
  const prompt = body?.promptId
    ? aioInterviewPrompts.find((item) => item.id === body.promptId)
    : undefined;
  if (!prompt || !body?.response || body.response.length > 8000) {
    return NextResponse.json({ error: "Provide a known prompt and a bounded response." }, { status: 400 });
  }
  const response = body.response;
  const answerWords = words(response);
  const requiredDimensions = [
    ["recommendation", /\b(recommend|propose|would use|should)\b/i],
    ["boundary", /\b(boundary|scope|permission|approval|read-only|least privilege)\b/i],
    ["evidence", /\b(evidence|metric|test|evaluate|citation|baseline)\b/i],
    ["verification", /\b(verify|monitor|review|regression|check)\b/i],
    ["ownership", /\b(owner|stakeholder|escalat|human|team)\b/i],
    ["tradeoff", /\b(tradeoff|risk|cost|latency|constraint|failure)\b/i],
  ] as const;
  const missing = requiredDimensions
    .filter(([, matcher]) => !matcher.test(response))
    .map(([label]) => label);
  const score = Math.min(100, Math.round(20 + Math.min(answerWords.length, 220) * 0.12 + (6 - missing.length) * 11));
  const complete = answerWords.length >= 80 && missing.length <= 1;
  return NextResponse.json({
    score,
    complete,
    feedback: complete
      ? "Your first attempt has a clear operating sequence. Compare it to the examiner guidance, then revise for specificity."
      : `Add specific reasoning for: ${missing.join(", ") || "depth and concrete evidence"}.`,
    missing,
    followUp: prompt.followUp,
    examinerGuidance: {
      strongAnswer: prompt.strongAnswer,
      commonMiss: prompt.commonMiss,
      rubric: prompt.rubric,
    },
  });
}
