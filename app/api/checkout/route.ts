import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser, serviceSupabase } from "@/lib/server-supabase";
import { commerceConfiguration, configuredPriceFor, isPurchasableTrack } from "@/lib/commerce-enrollment";
import { stripeClient } from "@/lib/commerce";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { trackId?: unknown } | null;
  if (!isPurchasableTrack(body?.trackId)) return NextResponse.json({ error: "Choose a valid track." }, { status: 400 });
  if (!commerceConfiguration()) return NextResponse.json({ error: "Checkout is not configured in this environment." }, { status: 503 });

  const user = await authenticatedUser(request.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Sign in before starting checkout." }, { status: 401 });
  try {
    const supabase = serviceSupabase();
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("track_id", body.trackId)
      .maybeSingle();
    if (enrollment?.status === "active") return NextResponse.json({ error: "This track is already active on your account." }, { status: 409 });

    const stripe = stripeClient();
    const { data: storedCustomer } = await supabase
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    let customerId = storedCustomer?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { engineer_zero_user_id: user.id },
      });
      customerId = customer.id;
      const { error } = await supabase.from("stripe_customers").upsert({ user_id: user.id, stripe_customer_id: customerId });
      if (error) throw error;
    }

    const price = configuredPriceFor(body.trackId);
    if (!price) throw new Error("Track price is not configured.");
    const appUrl = process.env.APP_URL!;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price, quantity: 1 }],
      metadata: { engineer_zero_user_id: user.id, engineer_zero_track_id: body.trackId },
      success_url: `${appUrl}/learn?checkout=success`,
      cancel_url: `${appUrl}/learn?checkout=cancelled`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Checkout creation failed", error);
    return NextResponse.json({ error: "Checkout is temporarily unavailable. No enrollment has been changed." }, { status: 503 });
  }
}
