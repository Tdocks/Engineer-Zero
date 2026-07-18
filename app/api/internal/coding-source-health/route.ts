import { NextResponse } from "next/server";
import { codingSources } from "@/lib/coding-developer";
import { codingSourceHealthRecords, type SourceReachability } from "@/lib/coding-source-health";
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
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized source-health request." }, { status: 401 });
  }
  const reachability = Object.fromEntries(await Promise.all(Object.values(codingSources).map(async (source) => [source.id, await checkSource(source.url)]))) as SourceReachability;
  const records = codingSourceHealthRecords(new Date(), reachability);
  try {
    const { error } = await serviceSupabase().from("coding_source_reviews").upsert(records.map(({ source, status }) => ({
      source_id: source.id,
      source_version: source.version,
      canonical_url: source.url,
      last_verified: source.lastVerified,
      revalidate_by: source.revalidateBy ?? source.lastVerified,
      status,
      reviewer_note: status === "needs_attention" ? "Automated reachability check did not receive a successful response; technical review required." : null,
    })), { onConflict: "source_id,source_version" });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "Source-health persistence is unavailable. No publication state changed." }, { status: 503 });
  }
  const blocked = records.filter(({ status }) => status !== "technical_approved");
  return NextResponse.json({ checked: records.length, blocked: blocked.length, records: records.map(({ source, status, httpStatus }) => ({ id: source.id, status, httpStatus })) });
}
