import { NextResponse } from "next/server";
import { aioPublicCatalog } from "@/lib/aio-public-catalog";
import { itSupportPublicCatalog } from "@/lib/it-support-public-catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const seed = url.searchParams.get("attempt") ?? crypto.randomUUID();
  const track = url.searchParams.get("track") ?? "applied-ai-operations";
  if (track === "applied-ai-operations") return NextResponse.json(aioPublicCatalog(seed));
  if (track === "it-support-technician") return NextResponse.json(itSupportPublicCatalog(seed));
  return NextResponse.json({ error: "Unknown course track." }, { status: 404 });
}
