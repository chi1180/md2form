import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type PlanTier } from "@/lib/plans";

interface UserProfileRow {
  user_id: string;
  plan_tier: PlanTier;
}

export async function getOrCreateUserPlan(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
): Promise<PlanTier> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id,plan_tier")
    .eq("user_id", userId)
    .maybeSingle<UserProfileRow>();

  if (!error && data?.plan_tier) {
    return data.plan_tier;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("user_profiles")
    .insert({ user_id: userId, plan_tier: "free" })
    .select("plan_tier")
    .single();

  if (!insertError && inserted?.plan_tier) {
    return inserted.plan_tier as PlanTier;
  }

  const { data: fallback } = await supabase
    .from("user_profiles")
    .select("plan_tier")
    .eq("user_id", userId)
    .maybeSingle();

  if (fallback?.plan_tier === "pro") {
    return "pro";
  }

  return "free";
}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      user: null,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const planTier = await getOrCreateUserPlan(supabase, user.id);

  return { supabase, user, planTier, unauthorized: null };
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function requireFormOwner(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  formId: string,
) {
  const { data, error } = await supabase
    .from("forms")
    .select("id")
    .eq("id", formId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return null;
}
