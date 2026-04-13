"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseMarkdownToForm } from "md2form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CardLoadingSkeleton } from "@/components/card-loading-skeleton";
import { MarkdownEditor } from "@/components/markdown-editor";
import { FormRenderer, type FormData } from "@/components/form-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_FORM_FRONTMATTER_MARKDOWN } from "@/lib/CONFIG";

interface FormBuilderProps {
  mode: "create" | "edit";
  formId?: string;
  initialMarkdown: string;
  initialIsPublic?: boolean;
  initialAcceptingResponses?: boolean;
  initialResponseLimit?: number | null;
  initialPublicSlug?: string | null;
}

export function FormBuilder({
  mode,
  formId,
  initialMarkdown,
  initialIsPublic = false,
  initialAcceptingResponses = true,
  initialResponseLimit = null,
  initialPublicSlug = null,
}: FormBuilderProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [acceptingResponses, setAcceptingResponses] = useState(
    initialAcceptingResponses,
  );
  const [responseLimit, setResponseLimit] = useState<string>(
    initialResponseLimit === null ? "" : String(initialResponseLimit),
  );
  const [regeneratePublicSlug, setRegeneratePublicSlug] = useState(false);
  const [publicSlug, setPublicSlug] = useState(initialPublicSlug);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<FormData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [submitPreviewOpen, setSubmitPreviewOpen] = useState(false);
  const [submittedPayloadJson, setSubmittedPayloadJson] = useState("");
  const previousSectionCountRef = useRef(0);

  const countSections = (value: string) => {
    const matches = value.match(/^##\s+.+$/gm);
    return matches?.length ?? 0;
  };

  const siteOrigin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "";

  const toSerializable = (input: unknown): unknown => {
    if (typeof File !== "undefined" && input instanceof File) {
      return {
        name: input.name,
        size: input.size,
        type: input.type,
        lastModified: input.lastModified,
      };
    }

    if (Array.isArray(input)) {
      return input.map((item) => toSerializable(item));
    }

    if (input && typeof input === "object") {
      const entries = Object.entries(input as Record<string, unknown>).map(
        ([key, value]) => [key, toSerializable(value)],
      );
      return Object.fromEntries(entries);
    }

    return input;
  };

  const handleMarkdownChange = (nextMarkdown: string) => {
    const previousSectionCount = previousSectionCountRef.current;
    const nextSectionCount = countSections(nextMarkdown);

    if (nextSectionCount > previousSectionCount) {
      setPreviewPageIndex((prev) => prev + 1);
    }

    previousSectionCountRef.current = nextSectionCount;

    if (nextMarkdown.trim().length === 0) {
      setMarkdown(DEFAULT_FORM_FRONTMATTER_MARKDOWN);
      return;
    }

    setMarkdown(nextMarkdown);
  };

  useEffect(() => {
    previousSectionCountRef.current = countSections(markdown);
  }, [markdown]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const effectiveMarkdown =
        markdown.trim().length === 0 ? DEFAULT_FORM_FRONTMATTER_MARKDOWN : markdown;

      try {
        const parsed = (await parseMarkdownToForm(effectiveMarkdown)) as FormData;
        setPreview(parsed);
        setParseError(null);
      } catch (error) {
        setPreview(null);
        const message = error instanceof Error ? error.message : "Failed to parse markdown";
        setParseError(message);
        toast.error(message);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [markdown]);

  const submitLabel = useMemo(() => {
    if (loading) {
      return mode === "create" ? "Creating..." : "Saving...";
    }
    return mode === "create" ? "Create form" : "Save changes";
  }, [loading, mode]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const endpoint = mode === "create" ? "/api/forms" : `/api/forms/${formId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: preview?.title || "Untitled Form",
          description: preview?.description || null,
          markdown,
          isPublic,
          acceptingResponses,
          responseLimit:
            responseLimit.trim().length === 0 ? null : Number(responseLimit),
          regeneratePublicSlug,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to save form.");
      }

      toast.success(mode === "create" ? "Form created" : "Form updated");

      if (mode === "create") {
        router.push(`/forms/${json.id}`);
      } else {
        if (isPublic || regeneratePublicSlug) {
          const refreshed = await fetch(`/api/forms/${formId}`);
          if (refreshed.ok) {
            const refreshedJson = await refreshed.json();
            setPublicSlug(refreshedJson.form?.public_slug || null);
          }
        }
        setRegeneratePublicSlug(false);
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Public form
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={acceptingResponses}
            onChange={(e) => setAcceptingResponses(e.target.checked)}
          />
          Accept responses
        </label>

        <label className="inline-flex items-center gap-2">
          Response limit
          <Input
            className="h-8 w-28"
            type="number"
            min={0}
            value={responseLimit}
            onChange={(e) => setResponseLimit(e.target.value)}
            placeholder="Unlimited"
          />
        </label>

        {mode === "edit" && isPublic && (
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={regeneratePublicSlug}
              onChange={(e) => setRegeneratePublicSlug(e.target.checked)}
            />
            Regenerate share link on save
          </label>
        )}
      </div>

      {mode === "edit" && isPublic && publicSlug && (
        <p className="text-sm text-muted-foreground">
          Share URL: <code>{`${siteOrigin}/f/${publicSlug}`}</code>
        </p>
      )}

      <div className="grid min-h-[560px] gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <MarkdownEditor value={markdown} onChange={handleMarkdownChange} />
        </div>
        <div className="overflow-auto rounded-lg border border-border p-4">
          {parseError ? (
            <p className="text-sm text-destructive">{parseError}</p>
          ) : preview ? (
            <FormRenderer
              formData={preview}
              pageIndex={previewPageIndex}
              onPageIndexChange={setPreviewPageIndex}
              onSubmit={(payload) => {
                const serializablePayload = toSerializable(payload);
                setSubmittedPayloadJson(
                  JSON.stringify(serializablePayload, null, 2),
                );
                setSubmitPreviewOpen(true);
              }}
            />
          ) : (
            <CardLoadingSkeleton rows={6} />
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading || !!parseError}>
          {submitLabel}
        </Button>
      </div>

      <Dialog open={submitPreviewOpen} onOpenChange={setSubmitPreviewOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Submitted Payload (JSON)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border bg-background">
            <SyntaxHighlighter
              language="json"
              style={resolvedTheme === "dark" ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                background: "transparent",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
              showLineNumbers
            >
              {submittedPayloadJson}
            </SyntaxHighlighter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
