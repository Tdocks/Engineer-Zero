import { NextResponse } from "next/server";
import { gradeCourseAttempt, type CourseItemKind, findCourseItem } from "@/lib/aio-grade";
import type { StructuredEvidence } from "@/lib/course-types";
import { authenticatedUser, serviceSupabase } from "@/lib/server-supabase";

const trackId = "applied-ai-operations";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    kind?: CourseItemKind;
    itemId?: string;
    answers?: Record<string, string>;
    evidence?: StructuredEvidence;
    missionChoices?: Record<string, string>;
    revisionOf?: string;
  } | null;
  if (!body?.kind || !body.itemId || !body.evidence || !["module", "lab", "mission"].includes(body.kind)) {
    return NextResponse.json({ error: "Provide a valid AIO activity and complete structured evidence." }, { status: 400 });
  }
  const user = await authenticatedUser(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Sign in to create verified evidence." }, { status: 401 });
  try {
    const supabase = serviceSupabase();
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("track_id", trackId)
      .eq("status", "active")
      .maybeSingle();
    if (!enrollment) return NextResponse.json({ error: "An active AIO enrollment is required." }, { status: 403 });
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("course_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("track_id", trackId)
      .gte("created_at", since);
    if ((count ?? 0) >= 60) return NextResponse.json({ error: "Daily verified-attempt limit reached. Keep working locally and return tomorrow." }, { status: 429 });
    const graded = gradeCourseAttempt({ kind: body.kind, itemId: body.itemId, answers: body.answers ?? {}, evidence: body.evidence, missionChoices: body.missionChoices ?? {} });
    const item = findCourseItem(body.kind, body.itemId);
    if (!graded || !item) return NextResponse.json({ error: "Unknown AIO activity." }, { status: 404 });
    const mode = "mode" in item ? item.mode : undefined;
    const dimension =
      body.kind === "module"
        ? "understands"
        : body.kind === "mission"
          ? "defends"
          : mode === "Production Incident"
            ? "troubleshoots"
            : mode === "AI Builder"
              ? "ai_collaboration"
              : "builds";
    const { error } = await supabase.from("course_attempts").insert({
      user_id: user.id, track_id: trackId, item_id: item.id, content_version: "aio-v2-draft",
      kind: body.kind, evidence: body.evidence, answers: body.answers ?? {}, mission_choices: body.missionChoices ?? {},
      competency_weights: item.competencies, evidence_dimension: dimension, score: graded.score,
      complete: graded.complete, revision_of: body.revisionOf ?? null,
    });
    if (error) throw error;
    return NextResponse.json(graded, { status: 201 });
  } catch (error) {
    console.error("Verified AIO attempt failed", error);
    return NextResponse.json({ error: "Verified evidence is temporarily unavailable. Your local draft remains safe." }, { status: 503 });
  }
}
