import { NextRequest, NextResponse } from "next/server";
import { tracks } from "@/lib/tracks";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { trackId?: keyof typeof tracks } | null;
  if (!body?.trackId || !tracks[body.trackId]) return NextResponse.json({ error: "Choose a valid track." }, { status: 400 });
  // Phase-1 checkout boundary: require authenticated user, map trackId to server-only Stripe price ID,
  // create Stripe Checkout, and rely on the verified webhook—not the browser redirect—for enrollment.
  return NextResponse.json({ error: "Stripe is not configured. Add server-side Stripe credentials to activate checkout." }, { status: 503 });
}
