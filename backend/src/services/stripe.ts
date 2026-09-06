import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export function getStripe(): Stripe | null {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret, { apiVersion: "2025-04-30.basil" });
}

export function getWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET || "";
}
