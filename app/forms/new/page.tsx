"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormBuilder } from "@/components/forms/form-builder";
import { DEFAULT_BUILDER_MARKDOWN } from "@/lib/default-markdown";
import { getFormLimitByPlan, type PlanTier } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function NewFormPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [planTier, setPlanTier] = useState<PlanTier>("free");

  useEffect(() => {
    let active = true;

    async function guard() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!user) {
        router.replace("/auth/sign-in?next=/forms/new");
        return;
      }

      setReady(true);
    }

    guard().catch(() => {
      if (!active) {
        return;
      }

      router.replace("/auth/sign-in?next=/forms/new");
    });

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    let active = true;

    async function checkPlanLimit() {
      const response = await fetch("/api/forms", { cache: "no-store" });
      const json = await response.json().catch(() => null);

      if (!active || !response.ok || !Array.isArray(json?.forms)) {
        return;
      }

      if (json.plan_tier === "pro") {
        setPlanTier("pro");
      }

      const limit = getFormLimitByPlan(json.plan_tier === "pro" ? "pro" : "free");

      if (json.forms.length >= limit) {
        toast.error(
          `Plan limit reached (${limit} forms). Delete one form to create a new one.`,
        );
        router.replace("/dashboard");
      }
    }

    checkPlanLimit().catch(() => undefined);

    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Create form</h1>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Current plan: {planTier.toUpperCase()} (max {getFormLimitByPlan(planTier)} forms)
        </p>
        <FormBuilder mode="create" initialMarkdown={DEFAULT_BUILDER_MARKDOWN} />
      </div>
    </main>
  );
}
