import { NextResponse } from "next/server";
import { codingExecutionProvider, type ExecutionRequest } from "@/lib/coding-execution";

const recentRequests = new Map<string, number[]>();

export async function POST(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (recentRequests.get(client) ?? []).filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= 6) return NextResponse.json({ error: "Too many execution requests. Continue locally and try again later." }, { status: 429 });
  recent.push(now);
  recentRequests.set(client, recent);
  const body = (await request.json().catch(() => null)) as ExecutionRequest | null;
  if (!body) return NextResponse.json({ error: "Provide a bounded execution request." }, { status: 400 });
  const result = await codingExecutionProvider.execute(body);
  return NextResponse.json(result, { status: result.status === "rejected" ? 400 : result.status === "unavailable" ? 503 : 200 });
}
