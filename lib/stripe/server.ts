import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe/env";

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  return stripeClient;
}
