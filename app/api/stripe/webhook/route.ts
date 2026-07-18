import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Webhook verification is not configured." }, { status: 400 });
  // Production implementation verifies the Stripe signature, stores event IDs idempotently,
  // and creates/revokes Supabase enrollments only from verified events.
  return NextResponse.json({ received: true, configured: false });
}
