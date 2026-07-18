import "server-only";

import Stripe from "stripe";
import {
  commerceConfiguration,
  configuredPriceFor,
  enrollmentIntentFromCheckout,
  isPurchasableTrack,
  purchasableTrackIds,
  type CheckoutEnrollmentIntent,
  type PurchasableTrackId,
} from "./commerce-enrollment";

export {
  commerceConfiguration,
  configuredPriceFor,
  enrollmentIntentFromCheckout,
  isPurchasableTrack,
  purchasableTrackIds,
};
export type { CheckoutEnrollmentIntent, PurchasableTrackId };

export function stripeClient(env: NodeJS.ProcessEnv = process.env) {
  if (!env.STRIPE_SECRET_KEY) throw new Error("Stripe server credentials are not configured.");
  return new Stripe(env.STRIPE_SECRET_KEY);
}
