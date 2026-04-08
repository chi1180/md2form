import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getSiteUrl, getStripeProPriceId } from "@/lib/stripe/env";
import { getStripeServerClient } from "@/lib/stripe/server";

export async function POST() {
  try {
    const { supabase, user, unauthorized } = await requireUser();
    if (unauthorized || !user) {
      return unauthorized;
    }

    const stripe = getStripeServerClient();
    const siteUrl = getSiteUrl();
    const priceId = getStripeProPriceId();

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase.from("user_profiles").upsert(
        { user_id: user.id, stripe_customer_id: customerId },
        { onConflict: "user_id" },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/settings?billing=success`,
      cancel_url: `${siteUrl}/settings?billing=cancel`,
      allow_promotion_codes: true,
      metadata: { user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create billing checkout session.",
      },
      { status: 500 },
    );
  }
}
