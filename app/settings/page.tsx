"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthNav } from "@/components/auth-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getFormLimitByPlan, type PlanTier } from "@/lib/plans";

interface CurrentUser {
  id: string;
  email: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [formCount, setFormCount] = useState(0);
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [billingStatus, setBillingStatus] = useState<string>("none");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [redirectingBilling, setRedirectingBilling] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!authUser) {
        router.replace("/auth/sign-in?next=/settings");
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email || null,
        created_at: authUser.created_at,
      });

      const formsResponse = await fetch("/api/forms", { cache: "no-store" });
      const formsJson = await formsResponse.json().catch(() => null);

      if (!active) {
        return;
      }

      if (formsResponse.ok && Array.isArray(formsJson?.forms)) {
        setFormCount(formsJson.forms.length);
        if (formsJson.plan_tier === "pro") {
          setPlanTier("pro");
        }
      }

      setLoading(false);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("billing_status,plan_tier,current_period_end,cancel_at_period_end")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (profile?.plan_tier === "pro") {
        setPlanTier("pro");
      }

      setBillingStatus(
        typeof profile?.billing_status === "string" ? profile.billing_status : "none",
      );

      setCurrentPeriodEnd(
        typeof profile?.current_period_end === "string" ? profile.current_period_end : null,
      );

      setCancelAtPeriodEnd(profile?.cancel_at_period_end === true);
    }

    load().catch(() => {
      if (!active) {
        return;
      }
      router.replace("/dashboard");
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return null;
  }

  const handleUpgrade = async () => {
    setRedirectingBilling(true);
    try {
      const response = await fetch("/api/billing/checkout", { method: "POST" });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.url) {
        throw new Error(json?.error || "Failed to open checkout.");
      }
      window.location.href = json.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open checkout.");
    } finally {
      setRedirectingBilling(false);
    }
  };

  const handleManageBilling = async () => {
    setRedirectingBilling(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.url) {
        throw new Error(json?.error || "Failed to open billing portal.");
      }
      window.location.href = json.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal.");
    } finally {
      setRedirectingBilling(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Account settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account session and plan usage.
            </p>
          </div>
          <AuthNav />
        </header>

        <div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {user?.email || "Unknown"}
            </p>
            <p>
              <span className="text-muted-foreground">User ID:</span> {user?.id}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Current plan:</span> {planTier.toUpperCase()}
            </p>
            <p>
              <span className="text-muted-foreground">Form usage:</span> {formCount} / {getFormLimitByPlan(planTier)}
            </p>
            <p>
              <span className="text-muted-foreground">Billing status:</span> {billingStatus}
            </p>
            <p>
              <span className="text-muted-foreground">Current period end:</span>{" "}
              {currentPeriodEnd
                ? new Date(currentPeriodEnd).toLocaleString()
                : "Not available"}
            </p>
            <p>
              <span className="text-muted-foreground">Auto-renew:</span>{" "}
              {cancelAtPeriodEnd ? "Off (cancels at period end)" : "On"}
            </p>
            <p className="text-muted-foreground">
              Use upgrade/manage billing to change your plan.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {planTier === "free" ? (
                <Button onClick={handleUpgrade} disabled={redirectingBilling}>
                  {redirectingBilling ? "Opening..." : "Upgrade to Pro"}
                </Button>
              ) : (
                <Button variant="outline" onClick={handleManageBilling} disabled={redirectingBilling}>
                  {redirectingBilling ? "Opening..." : "Manage billing"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the sign out button in the top navigation to end your current session.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
