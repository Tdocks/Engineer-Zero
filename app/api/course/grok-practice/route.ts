import { NextRequest, NextResponse } from "next/server";
import {
  fallbackGrokPracticeResult,
  getGrokPracticeTask,
  GROK_PRACTICE_DAILY_LIMIT_DEFAULT,
  isGrokPracticeTaskId,
  runLiveGrokPractice,
} from "@/lib/aio-grok-practice";

const dailyLimit = Number(process.env.XAI_DAILY_LIMIT ?? GROK_PRACTICE_DAILY_LIMIT_DEFAULT);
const usageByDay = new Map<string, number>();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function incrementUsage() {
  const key = todayKey();
  const next = (usageByDay.get(key) ?? 0) + 1;
  usageByDay.set(key, next);
  return next;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { taskId?: string; forceFallback?: boolean }
    | null;

  if (!body?.taskId || !isGrokPracticeTaskId(body.taskId)) {
    return NextResponse.json(
      {
        error:
          "taskId must be one of: classify-cite, abstain-conflict, schema-repair.",
      },
      { status: 400 },
    );
  }

  const task = getGrokPracticeTask(body.taskId);
  if (!task) {
    return NextResponse.json({ error: "Unknown practice task." }, { status: 400 });
  }

  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey || body.forceFallback) {
    return NextResponse.json(
      {
        ...fallbackGrokPracticeResult(
          task,
          "XAI_API_KEY is not configured (or fallback forced). Use this deterministic fixture for the lab RUN-TRACE; live practice is optional for packet complete.",
        ),
        configured: Boolean(apiKey),
      },
      { status: apiKey ? 200 : 503 },
    );
  }

  const used = usageByDay.get(todayKey()) ?? 0;
  if (used >= dailyLimit) {
    return NextResponse.json(
      {
        ...fallbackGrokPracticeResult(
          task,
          `Daily live Grok practice limit (${dailyLimit}) reached. Use the deterministic fallback fixture.`,
        ),
        configured: true,
        limitReached: true,
      },
      { status: 429 },
    );
  }

  try {
    const result = await runLiveGrokPractice(task, apiKey);
    incrementUsage();
    return NextResponse.json({ ...result, configured: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Live Grok call failed.";
    return NextResponse.json(
      {
        ...fallbackGrokPracticeResult(
          task,
          `${message} Deterministic fallback returned for the lab.`,
        ),
        configured: true,
        liveError: true,
      },
      { status: 502 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.XAI_API_KEY?.trim()),
    tasks: ["classify-cite", "abstain-conflict", "schema-repair"],
    model: "grok-4.5",
    dailyLimit,
    note: "POST { taskId }. Server-only XAI_API_KEY. Never send keys from the browser.",
  });
}
