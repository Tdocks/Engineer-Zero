import { NextResponse } from "next/server";
import { courseSourceHealthRecords, courseSourceUrls, type SourceReachability } from "@/lib/course-source-health";
import { serviceSupabase } from "@/lib/server-supabase";

export const runtime = "nodejs";

async function checkSource(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-256", "User-Agent": "Engineer-Zero-Source-Health/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    return { reachable: response.status >= 200 && response.status < 400, httpStatus: response.status };
  } catch {
    return { reachable: false, httpStatus: null };
  }
}

export async function GET(request: Request) {
  const secret = process.env.SOURCE_REVALIDATION_SECRET ?? process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Unauthorized source-health request." }, { status: 401 });
  const reachability = Object.fromEntries(await Promise.all(courseSourceUrls().map(async (url) => [url, await checkSource(url)]))) as SourceReachability;
  const records = courseSourceHealthRecords(new Date(), reachability);
  try {
    const { error } = await serviceSupabase().from("course_source_reviews").upsert(records.map((record) => ({
      track_id: record.trackId,
      item_id: record.itemId,
      content_version: record.contentVersion,
      canonical_url: record.source.url,
      source_version: record.source.version ?? "unversioned",
      supported_claim: record.source.supportedClaim ?? "Unmapped claim",
      accessed_on: record.source.accessed,
      revalidate_by: record.source.revalidateBy ?? record.source.accessed,
      status: record.status,
      reviewer_note: record.status === "needs_attention" ? "Automated reachability check did not receive a successful response; technical review required." : null,
    })), { onConflict: "track_id,item_id,content_version,canonical_url,source_version" });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "Source-health persistence is unavailable. No publication state changed." }, { status: 503 });
  }
  const blocked = records.filter((record) => record.status !== "author_verified");
  return NextResponse.json({ checked: records.length, blocked: blocked.length, records: blocked.map((record) => ({ trackId: record.trackId, itemId: record.itemId, status: record.status, httpStatus: record.httpStatus })) });
}
