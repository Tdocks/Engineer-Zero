import { NextRequest, NextResponse } from "next/server";

const maxChars = 4000;
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { prompt?: string; response?: string } | null;
  if (!body?.prompt || !body?.response || body.prompt.length > maxChars || body.response.length > maxChars) return NextResponse.json({ error: "A bounded prompt and response are required." }, { status: 400 });
  // Phase-4 boundary: authenticate Supabase user, check enrollment + daily quota, then call an approved provider.
  // No provider key is ever made available to the client. Structured feedback remains the launch fallback.
  return NextResponse.json({ error: "Live Kyra is not configured yet. Structured coaching remains available." }, { status: 503 });
}
