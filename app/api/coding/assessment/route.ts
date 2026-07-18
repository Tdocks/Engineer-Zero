import { NextResponse } from "next/server";
import { codingAssessmentBank, gradeCodingAssessment, publicCodingAssessment } from "@/lib/coding-assessment";

const recentRequests = new Map<string, number[]>();
const windowMs = 60_000;
const maxRequestsPerWindow = 18;

function permitted(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (recentRequests.get(client) ?? []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= maxRequestsPerWindow) return false;
  recent.push(now);
  recentRequests.set(client, recent);
  return true;
}

export async function GET(request: Request) {
  if (!permitted(request)) return NextResponse.json({ error: "Too many assessment requests. Take a short break before starting another form." }, { status: 429 });
  const url = new URL(request.url);
  const seed = url.searchParams.get("attempt") ?? crypto.randomUUID();
  const requestedLimit = Number(url.searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(requestedLimit) ? Math.max(6, Math.min(requestedLimit, 24)) : 12;
  return NextResponse.json({ version: "coding-assessment-v1", total: codingAssessmentBank.length, questions: publicCodingAssessment(seed, limit) });
}

export async function POST(request: Request) {
  if (!permitted(request)) return NextResponse.json({ error: "Too many scoring requests. Revise locally and retry in a minute." }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { answers?: Record<string, string>; questionIds?: string[] } | null;
  if (!body?.answers || !Array.isArray(body.questionIds) || body.questionIds.length < 1 || body.questionIds.length > 24)
    return NextResponse.json({ error: "Submit a bounded set of assessment answers." }, { status: 400 });
  if (body.questionIds.some((id) => !codingAssessmentBank.some((question) => question.id === id)))
    return NextResponse.json({ error: "Assessment contains an unknown question." }, { status: 400 });
  if (JSON.stringify(body.answers).length > 16_000)
    return NextResponse.json({ error: "Assessment response is too large." }, { status: 400 });
  const result = gradeCodingAssessment(body.answers, body.questionIds);
  if (!result.complete) return NextResponse.json({ error: "Answer every prompt before submitting.", ...result }, { status: 400 });
  return NextResponse.json(result);
}
