import "server-only";

import Stripe from "stripe";

export const purchasableTrackIds = ["applied-ai-operations", "it-support-technician"] as const;
export type PurchasableTrackId = (typeof purchasableTrackIds)[number];

export function isPurchasableTrack(trackId: unknown): trackId is PurchasableTrackId {
  return typeof trackId === "string" && (purchasableTrackIds as readonly string[]).includes(trackId);
}

export function configuredPriceFor(trackId: PurchasableTrackId, env: NodeJS.ProcessEnv = process.env) {
  return trackId === "applied-ai-operations"
    ? env.STRIPE_PRICE_APPLIED_AI_OPERATIONS
    : env.STRIPE_PRICE_IT_SUPPORT;
}

export function commerceConfiguration(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(
    env.STRIPE_SECRET_KEY &&
    env.STRIPE_WEBHOOK_SECRET &&
    env.STRIPE_PRICE_APPLIED_AI_OPERATIONS &&
    env.STRIPE_PRICE_IT_SUPPORT &&
    env.APP_URL,
  );
}

export function stripeClient(env: NodeJS.ProcessEnv = process.env) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("Stripe server credentials are not configured.");
  return new Stripe(env.STRIPE_SECRET_KEY);
}
