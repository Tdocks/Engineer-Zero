export const purchasableTrackIds = ["applied-ai-operations", "it-support-technician"] as const;
export type PurchasableTrackId = (typeof purchasableTrackIds)[number];

export function isPurchasableTrack(trackId: unknown): trackId is PurchasableTrackId {
  return typeof trackId === "string" && (purchasableTrackIds as readonly string[]).includes(trackId);
}

export function configuredPriceFor(trackId: PurchasableTrackId, env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
  return trackId === "applied-ai-operations"
    ? env.STRIPE_PRICE_APPLIED_AI_OPERATIONS
    : env.STRIPE_PRICE_IT_SUPPORT;
}

export function commerceConfiguration(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
  return Boolean(
    env.STRIPE_SECRET_KEY &&
    env.STRIPE_WEBHOOK_SECRET &&
    env.STRIPE_PRICE_APPLIED_AI_OPERATIONS &&
    env.STRIPE_PRICE_IT_SUPPORT &&
    env.APP_URL,
  );
}

export type CheckoutEnrollmentIntent = {
  userId: string | null | undefined;
  trackId: string | null | undefined;
  sessionId: string | null | undefined;
};

/**
 * Pure enrollment gate used by the Stripe webhook path. Redirect success alone
 * must never create an enrollment; only verified session metadata may.
 */
export function enrollmentIntentFromCheckout(intent: CheckoutEnrollmentIntent): {
  ok: true;
  userId: string;
  trackId: PurchasableTrackId;
  sessionId: string;
} | { ok: false; reason: string } {
  if (!intent.userId || typeof intent.userId !== "string") {
    return { ok: false, reason: "Checkout metadata is missing engineer_zero_user_id." };
  }
  if (!intent.sessionId || typeof intent.sessionId !== "string") {
    return { ok: false, reason: "Checkout session id is required for idempotent enrollment." };
  }
  if (!isPurchasableTrack(intent.trackId)) {
    return { ok: false, reason: "Checkout track is not a purchasable career track." };
  }
  return { ok: true, userId: intent.userId, trackId: intent.trackId, sessionId: intent.sessionId };
}
