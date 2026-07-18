import { NextResponse } from "next/server";
import { gradeCodingAssessment } from "@/lib/coding-assessment";
import { authenticatedUser, serviceSupabase } from "@/lib/server-supabase";

const allowedTracks = new Set(["applied-ai-operations", "it-support-technician"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    trackId?: string;
    answers?: Record<string, string>;
    questionIds?: string[];
  } | null;
  if (!body?.trackId || !allowedTracks.has(body.trackId) || !body.answers || !Array.isArray(body.questionIds) || body.questionIds.length < 1 || body.questionIds.length > 12) {
    return NextResponse.json({ error: "Provide one valid enrolled track and a bounded assessment form." }, { status: 400 });
  }
  const user = await authenticatedUser(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Sign in to create verified coding evidence." }, { status: 401 });
  try {
    const supabase = serviceSupabase();
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("track_id", body.trackId)
      .eq("status", "active")
      .maybeSingle();
    if (!enrollment) return NextResponse.json({ error: "An active enrollment is required for verified evidence." }, { status: 403 });
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("coding_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("attempt_kind", "assessment")
      .gte("created_at", since);
    if ((count ?? 0) >= 12) return NextResponse.json({ error: "Daily verified-assessment limit reached. Review the targeted drills before trying again." }, { status: 429 });
    const graded = gradeCodingAssessment(body.answers, body.questionIds);
    if (!graded.complete) return NextResponse.json({ error: "Every prompt needs a response before creating verified evidence." }, { status: 400 });
    const { error } = await supabase.from("coding_attempts").insert({
      user_id: user.id,
      track_id: body.trackId,
      program_id: "coding-developer",
      attempt_kind: "assessment",
      content_version: "coding-developer-v1",
      prompt_ids: body.questionIds,
      answers: body.answers,
      feedback: graded.feedback,
      competency_scores: graded.competencyScores,
      score: graded.score,
      verification_level: "server_scored",
    });
    if (error) throw error;
    return NextResponse.json({ ...graded, verification: "server_scored" }, { status: 201 });
  } catch (error) {
    console.error("Verified coding assessment failed", error);
    return NextResponse.json({ error: "Verified evidence is temporarily unavailable. Your local study record remains safe." }, { status: 503 });
  }
}
