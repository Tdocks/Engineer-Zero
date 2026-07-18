import { NextResponse } from "next/server";
import { decideCodingEvidencePacket } from "@/lib/coding-reviewer-workflow";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { packetId?: string; decision?: string; rubric?: Record<string, unknown>; note?: string } | null;
  const result = await decideCodingEvidencePacket(request.headers.get("authorization"), body ?? {});
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ decision: result.decision, certificateToken: "certificateToken" in result ? result.certificateToken : undefined });
}
