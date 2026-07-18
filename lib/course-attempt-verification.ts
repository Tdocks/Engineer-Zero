import "server-only";

import { findCourseItem, gradeCourseAttempt, type CourseItemKind } from "./aio-grade";
import { itSupportContentVersion, itSupportLabs, itSupportMissions, itSupportSprintModules } from "./it-support-content";
import { gradeItSupportCourseAttempt } from "./it-support-grade";
import { authenticatedUser, serviceSupabase } from "./server-supabase";
import type { StructuredEvidence } from "./course-types";

export type VerifiedCourseAttemptInput = {
  trackId: "applied-ai-operations" | "it-support-technician";
  kind: CourseItemKind;
  itemId: string;
  answers: Record<string, string>;
  evidence: StructuredEvidence;
  missionChoices: Record<string, string>;
  revisionOf?: string;
};

function itSupportItem(kind: CourseItemKind, itemId: string) {
  if (kind === "module") return itSupportSprintModules.find((item) => item.id === itemId);
  if (kind === "lab") return itSupportLabs.find((item) => item.id === itemId);
  return itSupportMissions.find((item) => item.id === itemId);
}

function evidenceDimension(input: VerifiedCourseAttemptInput, item: unknown) {
  const metadata = item as { capabilityLevel?: string; mode?: string };
  if (input.kind === "mission") return "defends";
  if (input.kind === "module") return "understands";
  if (metadata.mode === "Production Incident") return "troubleshoots";
  if (metadata.mode === "AI Builder" || metadata.capabilityLevel === "practice") return "ai_collaboration";
  return "builds";
}

/**
 * Creates an immutable, server-owned course-attempt record. The browser can
 * still save an offline/local-study draft when this path is unavailable, but
 * it cannot use that draft to create a verified readiness claim.
 */
export async function createVerifiedCourseAttempt(
  authorization: string | null,
  input: VerifiedCourseAttemptInput,
) {
  const user = await authenticatedUser(authorization);
  if (!user) return { status: 401 as const, error: "Sign in to create verified evidence." };

  try {
    const supabase = serviceSupabase();
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("track_id", input.trackId)
      .eq("status", "active")
      .maybeSingle();
    if (!enrollment) return { status: 403 as const, error: "An active track enrollment is required for verified evidence." };

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("course_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("track_id", input.trackId)
      .gte("created_at", since);
    if ((count ?? 0) >= 60) return { status: 429 as const, error: "Daily verified-attempt limit reached. Keep working locally and return tomorrow." };

    const isAio = input.trackId === "applied-ai-operations";
    const item = isAio ? findCourseItem(input.kind, input.itemId) : itSupportItem(input.kind, input.itemId);
    const graded = isAio
      ? gradeCourseAttempt(input)
      : gradeItSupportCourseAttempt(input);
    if (!item || !graded) return { status: 404 as const, error: "Unknown course activity." };

    const { error } = await supabase.from("course_attempts").insert({
      user_id: user.id,
      track_id: input.trackId,
      item_id: item.id,
      content_version: isAio ? "aio-v3-zero-to-role-draft" : itSupportContentVersion,
      kind: input.kind,
      evidence: input.evidence,
      answers: input.answers,
      mission_choices: input.missionChoices,
      competency_weights: item.competencies,
      evidence_dimension: evidenceDimension(input, item),
      score: graded.score,
      complete: graded.complete,
      revision_of: input.revisionOf ?? null,
    });
    if (error) throw error;
    return { status: 201 as const, graded: { ...graded, verification: "server_scored" as const } };
  } catch (error) {
    console.error("Verified course attempt failed", error);
    return { status: 503 as const, error: "Verified evidence is temporarily unavailable. Your local draft remains safe." };
  }
}
