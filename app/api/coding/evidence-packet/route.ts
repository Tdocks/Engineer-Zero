import { NextResponse } from "next/server";
import { createCodingEvidencePacket } from "@/lib/coding-reviewer-workflow";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { trackId?: string; learnerStatement?: string } | null;
  const result = await createCodingEvidencePacket(request.headers.get("authorization"), body ?? {});
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.packet, { status: result.status });
}
