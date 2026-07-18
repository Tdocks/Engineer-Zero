import { NextResponse } from "next/server";
import { aioPublicCatalog } from "@/lib/aio-public-catalog";

export async function GET(request: Request) {
  const seed = new URL(request.url).searchParams.get("attempt") ?? crypto.randomUUID();
  return NextResponse.json(aioPublicCatalog(seed));
}
