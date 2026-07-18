import { NextResponse } from "next/server";
import { createCodingExecutionProvider, type ExecutionRequest } from "@/lib/coding-execution";
import { authenticatedUser, serviceSupabase } from "@/lib/server-supabase";

const recentRequests = new Map<string, number[]>();
const allowedTracks = new Set(["applied-ai-operations", "it-support-technician"]);

export async function POST(request: Request) {
  const provider = createCodingExecutionProvider();
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (recentRequests.get(client) ?? []).filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= 6) return NextResponse.json({ error: "Too many execution requests. Continue locally and try again later." }, { status: 429 });
  recent.push(now);
  recentRequests.set(client, recent);

  const body = (await request.json().catch(() => null)) as (ExecutionRequest & { trackId?: string }) | null;
  if (!body) return NextResponse.json({ error: "Provide a bounded execution request." }, { status: 400 });

  // Personal local sandbox: rate-limit + execute. No Supabase auth/enrollment.
  // Hosted non-personal sandbox keeps enrollment checks.
  if (provider.policy && !provider.personal) {
    const user = await authenticatedUser(request.headers.get("authorization"));
    if (!user) return NextResponse.json({ error: "Sign in before using the isolated coding sandbox." }, { status: 401 });
    if (!body.trackId || !allowedTracks.has(body.trackId)) return NextResponse.json({ error: "Choose an enrolled track before using the isolated coding sandbox." }, { status: 400 });
    try {
      const { data: enrollment } = await serviceSupabase().from("enrollments").select("id").eq("user_id", user.id).eq("track_id", body.trackId).eq("status", "active").maybeSingle();
      if (!enrollment) return NextResponse.json({ error: "An active enrollment is required for sandbox access." }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Sandbox access verification is temporarily unavailable." }, { status: 503 });
    }
  }

  const result = await provider.execute(body);

  if (provider.policy && !provider.personal) {
    try {
      const user = await authenticatedUser(request.headers.get("authorization"));
      await serviceSupabase().from("coding_execution_events").insert({
        user_id: user?.id ?? null,
        exercise_id: body.exerciseId,
        provider: provider.name,
        request_summary: { language: body.language, command: body.command, files: body.files.map((file) => ({ path: file.path, bytes: new TextEncoder().encode(file.content).length })) },
        result_summary: { status: result.status, exitCode: result.exitCode, durationMs: result.durationMs, stdoutBytes: new TextEncoder().encode(result.stdout).length, stderrBytes: new TextEncoder().encode(result.stderr).length },
      });
    } catch (error) {
      console.error("Coding sandbox audit event failed", error);
    }
  } else if (provider.policy && provider.personal && result.status !== "unavailable") {
    console.info(JSON.stringify({
      type: "personal.sandbox.audit",
      provider: provider.name,
      exerciseId: body.exerciseId,
      command: body.command,
      status: result.status,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
    }));
  }

  return NextResponse.json(result, { status: result.status === "rejected" ? 400 : result.status === "unavailable" ? 503 : 200 });
}
