function readEnv(name: string) {
  let value: string | undefined;

  switch (name) {
    case "NEXT_PUBLIC_SUPABASE_URL":
      value = process.env.NEXT_PUBLIC_SUPABASE_URL;
      break;
    case "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY":
      value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      break;
    case "SUPABASE_SERVICE_ROLE_KEY":
      value = process.env.SUPABASE_SERVICE_ROLE_KEY;
      break;
    default:
      value = undefined;
  }

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getSupabaseServiceRoleKey() {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}
