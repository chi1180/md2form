import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getSiteUrl } from "@/lib/stripe/env";
import { getStripeServerClient } from "@/lib/stripe/server";

export async function POST() {
  const { supabase, user, unauthorized } = await requireUser();
  if (unauthorized || !user) {
    return unauthorized;
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing customer found." }, { status: 400 });
  }

  const stripe = getStripeServerClient();
  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${getSiteUrl()}/settings`,
  });

  return NextResponse.json({ url: portal.url });
}
