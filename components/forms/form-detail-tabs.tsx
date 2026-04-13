"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CircleUserRound } from "lucide-react";
import { FormBuilder } from "@/components/forms/form-builder";
import { FormResponsesView } from "@/components/forms/form-responses-view";
import { PageLoading } from "@/components/page-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type TabKey = "questions" | "responses" | "settings";

interface FormRecord {
  id: string;
  title: string;
  description: string | null;
  markdown_source: string;
  is_public: boolean;
  accepting_responses: boolean;
  response_limit: number | null;
  public_slug: string | null;
}

interface ResponseAnswer {
  question_key?: string;
  question_type?: string;
  title?: string;
  answer?: unknown;
  signed_url?: string | null;
}

interface ResponseRow {
  id: string;
  submitted_at: string;
  answers_json: ResponseAnswer[];
  metadata: {
    ip?: string;
    userAgent?: string;
  } | null;
}

interface FormDetailTabsProps {
  formId: string;
  tab: TabKey;
}

function getSiteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

export function FormDetailTabs({ formId, tab }: FormDetailTabsProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<FormRecord | null>(null);
  const [responsesCache, setResponsesCache] = useState<ResponseRow[] | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    async function guardAndLoad() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!user) {
        router.replace(`/auth/sign-in?next=${encodeURIComponent(`/forms/${formId}`)}`);
        return;
      }

      const response = await fetch(`/api/forms/${formId}`, { cache: "no-store" });
      const json = await response.json().catch(() => null);

      if (!active) {
        return;
      }

      if (!response.ok) {
        router.replace("/dashboard");
        return;
      }

      setForm(json.form || null);
      setReady(true);
    }

    guardAndLoad().catch(() => {
      if (!active) {
        return;
      }
      router.replace("/dashboard");
    });

    return () => {
      active = false;
    };
  }, [formId, router]);

  const tabs = useMemo(
    () => [
      { key: "questions" as const, label: "Questions" },
      { key: "responses" as const, label: "Responses" },
      { key: "settings" as const, label: "Settings" },
    ],
    [],
  );

  const publicUrl = form?.public_slug ? `${getSiteOrigin()}/f/${form.public_slug}` : null;

  const handleCopyShareUrl = async () => {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Share link copied");
    } catch {
      toast.error("Failed to copy share link");
    }
  };

  if (!ready) {
    return <PageLoading message="Loading form editor..." className="min-h-[60vh]" />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{form?.title || "Form"}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCopied(false);
                setShareDialogOpen(true);
              }}
            >
              Share settings
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings" aria-label="Open account settings">
                <CircleUserRound className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (value === "questions" || value === "responses" || value === "settings") {
              router.push(`/forms/${formId}?tab=${value}`);
            }
          }}
        >
          <TabsList className="mx-auto">
            {tabs.map((item) => (
              <TabsTrigger key={item.key} value={item.key}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="questions">
            {form && (
              <FormBuilder
                mode="edit"
                formId={form.id}
                initialMarkdown={form.markdown_source}
                initialIsPublic={form.is_public}
                initialAcceptingResponses={form.accepting_responses}
                initialResponseLimit={form.response_limit}
                initialPublicSlug={form.public_slug}
              />
            )}
          </TabsContent>

          <TabsContent value="responses">
            <FormResponsesView
              formId={formId}
              cachedResponses={responsesCache}
              onResponsesLoaded={setResponsesCache}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Share settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Visibility: {form?.is_public ? "Public" : "Private"}</p>
                <p>Responses: {form?.accepting_responses ? "Accepting" : "Stopped"}</p>
                <p>
                  Response limit: {typeof form?.response_limit === "number" ? form.response_limit : "No limit"}
                </p>
                {publicUrl ? (
                  <p className="break-all">
                    Share URL:{" "}
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      {publicUrl}
                    </a>
                  </p>
                ) : (
                  <p>Share URL: not available (set form to public)</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share this form</DialogTitle>
              <DialogDescription>
                Copy the public link to share. Future channels (mail/SNS) can be added here.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm break-all text-muted-foreground">
                {publicUrl || "Share URL is not available yet. Set this form to public in Settings."}
              </div>

              <div className="rounded-md border border-dashed p-3">
                <p className="text-xs text-muted-foreground">
                  Coming soon: share via Email / X / LINE and additional channels.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={handleCopyShareUrl} disabled={!publicUrl}>
                {copied ? "Copied" : "Copy link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
