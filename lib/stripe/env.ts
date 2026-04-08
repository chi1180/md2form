function readEnv(name: string) {
  let value: string | undefined;

  switch (name) {
    case "STRIPE_SECRET_KEY":
      value = process.env.STRIPE_SECRET_KEY;
      break;
    case "STRIPE_WEBHOOK_SECRET":
      value = process.env.STRIPE_WEBHOOK_SECRET;
      break;
    case "STRIPE_PRICE_PRO_MONTHLY":
      value = process.env.STRIPE_PRICE_PRO_MONTHLY;
      break;
    case "NEXT_PUBLIC_SITE_URL":
      value = process.env.NEXT_PUBLIC_SITE_URL;
      break;
    default:
      value = undefined;
  }

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getStripeSecretKey() {
  return readEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return readEnv("STRIPE_WEBHOOK_SECRET");
}

export function getStripeProPriceId() {
  return readEnv("STRIPE_PRICE_PRO_MONTHLY");
}

export function getSiteUrl() {
  return readEnv("NEXT_PUBLIC_SITE_URL");
}
