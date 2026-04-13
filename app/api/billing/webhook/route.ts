import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getStripeWebhookSecret } from "@/lib/stripe/env";
import { getStripeServerClient } from "@/lib/stripe/server";

function subscriptionStatusToPlan(status: string) {
  if (
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "unpaid"
  ) {
    return "pro";
  }

  return "free";
}

function toIsoTimestamp(value: number | null | undefined) {
  if (!value || !Number.isFinite(value)) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const itemPeriodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value) => Number.isFinite(value));

  if (itemPeriodEnds.length === 0) {
    return null;
  }

  return Math.max(...itemPeriodEnds);
}

async function syncSubscriptionByCustomer(
  customerId: string,
  subscription: Stripe.Subscription,
) {
  const serviceRole = createSupabaseServiceRoleClient();

  await serviceRole
    .from("user_profiles")
    .update({
      stripe_subscription_id: subscription.id,
      billing_status: subscription.status,
      plan_tier: subscriptionStatusToPlan(subscription.status),
      current_period_end: toIsoTimestamp(getSubscriptionPeriodEnd(subscription)),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_customer_id", customerId);
}

async function syncSubscriptionById(subscription: Stripe.Subscription) {
  const serviceRole = createSupabaseServiceRoleClient();

  await serviceRole
    .from("user_profiles")
    .update({
      billing_status: subscription.status,
      plan_tier: subscriptionStatusToPlan(subscription.status),
      current_period_end: toIsoTimestamp(getSubscriptionPeriodEnd(subscription)),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : null;

  if (customerId) {
    await syncSubscriptionByCustomer(customerId, subscription);
    return;
  }

  await syncSubscriptionById(subscription);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId =
    invoice.parent?.subscription_details?.subscription;

  if (typeof subscriptionId !== "string") {
    return;
  }

  const stripe = getStripeServerClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionEvent(subscription);
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

  if (event.type === "checkout.session.completed") {
    const serviceRole = createSupabaseServiceRoleClient();
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
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.created"
  ) {
    const subscription = event.data.object;
    await handleSubscriptionEvent(subscription);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    await handleInvoicePaymentFailed(invoice);
  }

  return NextResponse.json({ received: true });
}
