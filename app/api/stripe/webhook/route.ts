import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { enrollmentIntentFromCheckout, isPurchasableTrack } from "@/lib/commerce-enrollment";
import { stripeClient } from "@/lib/commerce";
import { serviceSupabase } from "@/lib/server-supabase";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Webhook verification is not configured." }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature could not be verified." }, { status: 400 });
  }
  try {
    const supabase = serviceSupabase();
    const { data: existing } = await supabase.from("stripe_events").select("id").eq("id", event.id).maybeSingle();
    if (existing) return NextResponse.json({ received: true, duplicate: true });

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const intent = enrollmentIntentFromCheckout({
        userId: session.metadata?.engineer_zero_user_id ?? session.client_reference_id,
        trackId: session.metadata?.engineer_zero_track_id,
        sessionId: session.id,
      });
      if (!intent.ok) throw new Error(intent.reason);
      const { error } = await supabase.from("enrollments").upsert({
        user_id: intent.userId,
        track_id: intent.trackId,
        status: "active",
        stripe_checkout_session_id: intent.sessionId,
      }, { onConflict: "user_id,track_id" });
      if (error) throw error;
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      if (typeof charge.payment_intent === "string") {
        const sessions = await stripeClient().checkout.sessions.list({ payment_intent: charge.payment_intent, limit: 1 });
        const session = sessions.data[0];
        const trackId = session?.metadata?.engineer_zero_track_id;
        const userId = session?.metadata?.engineer_zero_user_id ?? session?.client_reference_id;
        if (userId && isPurchasableTrack(trackId)) {
          const { error } = await supabase.from("enrollments")
            .update({ status: "refunded" })
            .eq("user_id", userId)
            .eq("track_id", trackId);
          if (error) throw error;
        }
      }
    }

    const { error } = await supabase.from("stripe_events").insert({ id: event.id, type: event.type, payload: { api_version: event.api_version } });
    if (error) throw error;
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Webhook could not be processed. No unverified enrollment was created." }, { status: 503 });
  }
}
