import { NextResponse } from "next/server";
import { findRegistryItem, type RegistryTrackId } from "@/lib/course-content-registry";
import { authenticatedUser, serviceSupabase } from "@/lib/server-supabase";

const reviewRole: Record<string, string> = {
  instructional_design: "instructional_reviewer",
  technical_sme: "technical_reviewer",
  accessibility: "accessibility_reviewer",
  fictional_data: "fictional_data_reviewer",
  release: "release_manager",
};
const trackIds = new Set<RegistryTrackId>(["applied-ai-operations", "it-support-technician"]);

/**
 * Internal-only approval recorder. It is intentionally not exposed in the
 * learner UI: an active, qualified reviewer role and a known versioned item
 * are required before an approval can exist.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    trackId?: string;
    itemId?: string;
    contentVersion?: string;
    reviewArea?: keyof typeof reviewRole;
    decision?: "approved" | "changes_requested";
    note?: string;
  } | null;
  if (!body?.trackId || !trackIds.has(body.trackId as RegistryTrackId) || !body.itemId || !body.contentVersion || !body.reviewArea || !reviewRole[body.reviewArea] || !body.decision || typeof body.note !== "string" || body.note.length > 4000) {
    return NextResponse.json({ error: "Provide a known versioned item, review area, decision, and bounded review note." }, { status: 400 });
  }
  if (!findRegistryItem(body.trackId as RegistryTrackId, body.itemId, body.contentVersion))
    return NextResponse.json({ error: "The requested content item or version is not reviewable." }, { status: 404 });

  const user = await authenticatedUser(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Sign in with a reviewer account to record an approval." }, { status: 401 });
  try {
    const supabase = serviceSupabase();
    const { data: role } = await supabase
      .from("platform_reviewer_roles")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("role", reviewRole[body.reviewArea])
      .eq("active", true)
      .maybeSingle();
    if (!role) return NextResponse.json({ error: "Your account is not assigned to this qualified review role." }, { status: 403 });

    const { error } = await supabase.from("content_release_reviews").upsert({
      track_id: body.trackId,
      item_id: body.itemId,
      content_version: body.contentVersion,
      review_area: body.reviewArea,
      decision: body.decision,
      reviewer_id: user.id,
      note: body.note.trim(),
    }, { onConflict: "track_id,item_id,content_version,review_area,reviewer_id" });
    if (error) throw error;
    return NextResponse.json({ saved: true, itemId: body.itemId, reviewArea: body.reviewArea, decision: body.decision }, { status: 201 });
  } catch (error) {
    console.error("Content release review failed", error);
    return NextResponse.json({ error: "Review recording is temporarily unavailable. Do not treat this item as approved." }, { status: 503 });
  }
}
