export const FREE_PLAN_FORM_LIMIT = 3;

export type PlanTier = "free" | "pro";

export const PLAN_LIMITS: Record<PlanTier, { formLimit: number }> = {
  free: { formLimit: 3 },
  pro: { formLimit: 1000 },
};

export function getFormLimitByPlan(plan: PlanTier) {
  return PLAN_LIMITS[plan].formLimit;
}
