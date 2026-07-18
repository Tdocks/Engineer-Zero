import "server-only";

import { authenticatedUser, serviceSupabase } from "./server-supabase";

const allowedTracks = new Set(["applied-ai-operations", "it-support-technician"]);
const reviewDecisions = new Set(["changes_requested", "approved", "rejected"]);

type PacketSnapshot = {
  verifiedAttemptIds: string[];
  githubEvidenceIds: string[];
  readiness: number;
  gates: Array<{ label: string; passed: boolean; detail: string }>;
  learnerStatement: string;
};

async function activeCodingReviewer(userId: string) {
  const supabase = serviceSupabase();
  const { data } = await supabase
    .from("coding_reviewer_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role", "coding_reviewer")
    .eq("active", true)
    .maybeSingle();
  return Boolean(data);
}

export async function createCodingEvidencePacket(
  authorization: string | null,
  input: { trackId?: string; learnerStatement?: string },
) {
  if (!input.trackId || !allowedTracks.has(input.trackId)) return { status: 400 as const, error: "Choose an enrolled track for this coding evidence packet." };
  if (typeof input.learnerStatement !== "string" || input.learnerStatement.trim().length < 80 || input.learnerStatement.length > 8_000)
    return { status: 400 as const, error: "Add an 80–8,000 character statement describing what you built, verified, and still need to improve." };
  const user = await authenticatedUser(authorization);
  if (!user) return { status: 401 as const, error: "Sign in to assemble reviewer evidence." };
  try {
    const supabase = serviceSupabase();
    const { data: enrollment } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("track_id", input.trackId).eq("status", "active").maybeSingle();
    if (!enrollment) return { status: 403 as const, error: "An active track enrollment is required for reviewer evidence." };

    const { data: attempts, error: attemptsError } = await supabase
      .from("coding_attempts")
      .select("id, attempt_kind, score")
      .eq("user_id", user.id)
      .eq("track_id", input.trackId)
      .eq("verification_level", "server_scored")
      .order("created_at", { ascending: false });
    if (attemptsError) throw attemptsError;
    const reviewedAttempts = (attempts ?? []).filter((attempt) => (attempt.score ?? 0) >= 75);
    const { data: github, error: githubError } = await supabase
      .from("coding_github_evidence")
      .select("id")
      .eq("user_id", user.id)
      .eq("track_id", input.trackId)
      .eq("verification_status", "verified");
    if (githubError) throw githubError;
    const kinds = new Set(reviewedAttempts.map((attempt) => attempt.attempt_kind));
    const gates = [
      { label: "Three server-scored coding attempts", passed: reviewedAttempts.length >= 3, detail: `${reviewedAttempts.length}/3 records at 75% or above` },
      { label: "Independent implementation or continuation evidence", passed: kinds.has("lab") || kinds.has("continuation"), detail: kinds.has("lab") || kinds.has("continuation") ? "A verified implementation record exists." : "A verified lab or continuation record is still required." },
      { label: "Scored technical defense", passed: kinds.has("interview"), detail: kinds.has("interview") ? "A verified interview record exists." : "A verified interview response is still required." },
      { label: "Verified GitHub collaboration evidence", passed: (github?.length ?? 0) >= 1, detail: `${github?.length ?? 0}/1 verified repository records` },
    ];
    const readiness = Math.round((gates.filter((gate) => gate.passed).length / gates.length) * 100);
    const snapshot: PacketSnapshot = {
      verifiedAttemptIds: reviewedAttempts.map((attempt) => attempt.id),
      githubEvidenceIds: (github ?? []).map((evidence) => evidence.id),
      readiness,
      gates,
      learnerStatement: input.learnerStatement.trim(),
    };
    const status = gates.every((gate) => gate.passed) ? "ready_for_review" : "draft";
    const { data: packet, error } = await supabase.from("coding_evidence_packets").insert({
      user_id: user.id,
      track_id: input.trackId,
      program_id: "coding-developer",
      snapshot,
      readiness,
      status,
      submitted_at: status === "ready_for_review" ? new Date().toISOString() : null,
    }).select("id, status, readiness").single();
    if (error) throw error;
    return { status: 201 as const, packet: { ...packet, gates } };
  } catch (error) {
    console.error("Coding evidence packet failed", error);
    return { status: 503 as const, error: "Reviewer evidence is temporarily unavailable. Your local study record remains safe." };
  }
}

export async function codingReviewerQueue(authorization: string | null) {
  const user = await authenticatedUser(authorization);
  if (!user) return { status: 401 as const, error: "Sign in with a reviewer account." };
  try {
    if (!await activeCodingReviewer(user.id)) return { status: 403 as const, error: "Your account is not an active Coding Developer reviewer." };
    const supabase = serviceSupabase();
    const { data, error } = await supabase.from("coding_evidence_packets")
      .select("id, user_id, track_id, readiness, status, submitted_at, assigned_reviewer_id, snapshot")
      .in("status", ["ready_for_review", "assigned", "changes_requested"])
      .order("submitted_at", { ascending: true });
    if (error) throw error;
    return { status: 200 as const, packets: data ?? [] };
  } catch (error) {
    console.error("Coding reviewer queue failed", error);
    return { status: 503 as const, error: "Reviewer queue is temporarily unavailable." };
  }
}

export async function decideCodingEvidencePacket(
  authorization: string | null,
  input: { packetId?: string; decision?: string; rubric?: Record<string, unknown>; note?: string },
) {
  if (!input.packetId || !reviewDecisions.has(input.decision ?? "") || !input.rubric || typeof input.note !== "string" || input.note.length > 8_000)
    return { status: 400 as const, error: "Provide a packet, structured rubric, review decision, and bounded note." };
  const user = await authenticatedUser(authorization);
  if (!user) return { status: 401 as const, error: "Sign in with a reviewer account." };
  try {
    if (!await activeCodingReviewer(user.id)) return { status: 403 as const, error: "Your account is not an active Coding Developer reviewer." };
    const supabase = serviceSupabase();
    const { data: packet } = await supabase.from("coding_evidence_packets")
      .select("id, user_id, track_id, status, assigned_reviewer_id")
      .eq("id", input.packetId)
      .maybeSingle();
    if (!packet) return { status: 404 as const, error: "Evidence packet not found." };
    if (packet.status !== "ready_for_review" && packet.assigned_reviewer_id !== user.id && packet.status !== "changes_requested")
      return { status: 409 as const, error: "This packet is not available for your decision." };

    const nextStatus = input.decision === "approved" ? "approved" : input.decision;
    const { error: updateError } = await supabase.from("coding_evidence_packets").update({
      status: nextStatus,
      assigned_reviewer_id: user.id,
      reviewer_note: input.note.trim(),
      reviewed_at: new Date().toISOString(),
    }).eq("id", packet.id);
    if (updateError) throw updateError;
    const { error: historyError } = await supabase.from("coding_reviewer_decisions").insert({
      packet_id: packet.id, reviewer_id: user.id, decision: input.decision, rubric: input.rubric, note: input.note.trim(),
    });
    if (historyError) throw historyError;

    // Only qualified human approval can create a certificate. No browser action
    // and no deterministic rubric can reach this branch by itself.
    if (input.decision === "approved") {
      const { data: existing } = await supabase.from("certificates").select("id, verification_token").eq("user_id", packet.user_id).eq("track_id", packet.track_id).maybeSingle();
      if (existing) return { status: 200 as const, decision: "approved", certificateToken: existing.verification_token };
      const { data: certificate, error: certificateError } = await supabase.from("certificates").insert({ user_id: packet.user_id, track_id: packet.track_id }).select("verification_token").single();
      if (certificateError) throw certificateError;
      return { status: 200 as const, decision: "approved", certificateToken: certificate.verification_token };
    }
    return { status: 200 as const, decision: input.decision };
  } catch (error) {
    console.error("Coding reviewer decision failed", error);
    return { status: 503 as const, error: "The review decision could not be saved. Do not treat the packet as approved." };
  }
}
