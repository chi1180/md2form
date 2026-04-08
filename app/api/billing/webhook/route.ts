import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getStripeWebhookSecret } from "@/lib/stripe/env";
import { getStripeServerClient } from "@/lib/stripe/server";

function subscriptionStatusToPlan(status: string) {
  if (status === "active" || status === "trialing") {
    return "pro";
  }

  return "free";
}

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid webhook signature",
      },
      { status: 400 },
    );
  }

  const serviceRole = createSupabaseServiceRoleClient();

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = typeof session.metadata?.user_id === "string" ? session.metadata.user_id : null;

      if (userId && typeof session.customer === "string") {
        await serviceRole
          .from("user_profiles")
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : null,
          }, { onConflict: "user_id" });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;

      if (customerId) {
        await serviceRole
          .from("user_profiles")
          .update({
            stripe_subscription_id: subscription.id,
            billing_status: subscription.status,
            plan_tier: subscriptionStatusToPlan(subscription.status),
            current_period_end: null,
          })
          .eq("stripe_customer_id", customerId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
