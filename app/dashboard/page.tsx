"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthNav } from "@/components/auth-nav";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getFormLimitByPlan, type PlanTier } from "@/lib/plans";

interface FormSummary {
  id: string;
  title: string;
  response_count: number;
  is_public: boolean;
  accepting_responses: boolean;
  public_slug: string | null;
}

function getSiteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [planTier, setPlanTier] = useState<PlanTier>("free");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setError(null);
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!user) {
        router.replace("/auth/sign-in?next=/dashboard");
        return;
      }

      const response = await fetch("/api/forms", { cache: "no-store" });
      const json = await response.json().catch(() => null);

      if (!active) {
        return;
      }

      if (!response.ok || !Array.isArray(json?.forms)) {
        setError(json?.error || "Failed to load forms.");
        setLoading(false);
        return;
      }

      setForms(json.forms);
      if (json.plan_tier === "pro") {
        setPlanTier("pro");
      }
      setLoading(false);
    }

    load().catch(() => {
      if (!active) {
        return;
      }
      setError("Failed to load forms.");
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return null;
  }

  const totalResponses = forms.reduce((sum, form) => sum + form.response_count, 0);
  const publicForms = forms.filter((form) => form.is_public).length;
  const formLimit = getFormLimitByPlan(planTier);
  const usage = `${forms.length} / ${formLimit}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Overview of your forms and response activity.
            </p>
          </div>
          <AuthNav showDashboard={false} />
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Form usage ({planTier.toUpperCase()})</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{usage}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Public forms</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{publicForms}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total responses</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{totalResponses}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manage forms</CardTitle>
            <div className="flex items-center gap-2">
              <Button asChild disabled={forms.length >= formLimit}>
                <Link href="/forms/new">New form</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {forms.length >= formLimit && (
              <p className="text-sm text-muted-foreground">
                You reached your current plan limit. Delete an existing form to create a new one.
              </p>
            )}

            {error && (
              <p className="text-sm text-muted-foreground">Could not load forms: {error}</p>
            )}

            {!error && forms.length === 0 && (
              <p className="text-sm text-muted-foreground">No forms yet. Create your first form.</p>
            )}

            {!error && forms.length > 0 && (
              <div className="grid gap-4">
                {forms.map((form) => (
                  <Card key={form.id}>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                      <div className="space-y-1">
                        <CardTitle>{form.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Responses: {form.response_count}
                          {" · "}
                          {form.is_public ? "Public" : "Private"}
                          {" · "}
                          {form.accepting_responses ? "Accepting" : "Stopped"}
                        </p>
                      </div>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/forms/${form.id}`} aria-label={`Open ${form.title}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardHeader>
                    {form.public_slug && (
                      <CardContent>
                        {(() => {
                          const shareUrl = `${getSiteOrigin()}/f/${form.public_slug}`;

                          return (
                            <p className="text-xs break-all text-muted-foreground">
                              Share link:{" "}
                              <a
                                href={shareUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary underline underline-offset-2"
                              >
                                {shareUrl}
                              </a>
                            </p>
                          );
                        })()}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
