"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FormRenderer, type FormData } from "@/components/form-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface PublicFormResponse {
  id: string;
  title: string;
  description: string | null;
  schema_json: FormData;
  accepting_responses: boolean;
  response_limit: number | null;
  response_count: number;
}

interface UploadUrlPayload {
  path: string;
  token: string;
}

interface PublicFormViewProps {
  slug: string;
}

function extractSignatureDataUrl(value: unknown) {
  return typeof value === "string" && value.startsWith("data:image/png;base64,")
    ? value
    : null;
}

function dataUrlToBlob(dataUrl: string) {
  const [header, payload] = dataUrl.split(",");
  if (!header || !payload || !header.includes("base64")) {
    return null;
  }

  const mimeMatch = header.match(/^data:(.*?);base64$/);
  if (!mimeMatch || mimeMatch[1] !== "image/png") {
    return null;
  }

  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: "image/png" });
}

export function PublicFormView({ slug }: PublicFormViewProps) {
  const [form, setForm] = useState<PublicFormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/public/forms/${slug}`, {
        cache: "no-store",
      });
      const json = await response.json().catch(() => null);

      if (!active) {
        return;
      }

      if (!response.ok) {
        setError(json?.error || "Failed to load form.");
        setLoading(false);
        return;
      }

      setForm(json.form);
      setLoading(false);
    }

    load().catch((err: unknown) => {
      if (!active) {
        return;
      }

      const message = err instanceof Error ? err.message : "Failed to load form.";
      setError(message);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [slug]);

  const canSubmit = useMemo(() => {
    if (!form) {
      return false;
    }

    if (!form.accepting_responses) {
      return false;
    }

    if (
      typeof form.response_limit === "number" &&
      form.response_count >= form.response_limit
    ) {
      return false;
    }

    return true;
  }, [form]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          Loading form...
        </CardContent>
      </Card>
    );
  }

  if (error || !form) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Form unavailable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{error || "This form does not exist."}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thank you</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Your response has been submitted.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!canSubmit && (
        <Card>
          <CardContent className="py-4 text-sm text-muted-foreground">
            This form is not accepting responses right now.
          </CardContent>
        </Card>
      )}

      <FormRenderer
        formData={form.schema_json}
        disableFileUpload
        onSubmit={async (payload) => {
          if (!canSubmit) {
            throw new Error("This form is not accepting responses.");
          }

          const supabase = createSupabaseBrowserClient();
          const responseId = crypto.randomUUID();

          const signaturePathByQuestionKey = new Map<string, string>();
          for (const response of payload.responses) {
            if (response.type !== "signature") {
              continue;
            }

            const signatureDataUrl = extractSignatureDataUrl(response.answer);
            if (!signatureDataUrl) {
              continue;
            }

            const blob = dataUrlToBlob(signatureDataUrl);
            if (!blob) {
              continue;
            }

            if (blob.size > 2 * 1024 * 1024) {
              throw new Error("Signature image exceeds 2MB limit.");
            }

            const questionKey =
              typeof response.id === "string"
                ? response.id
                : `page-${response.pageIndex}-element-${response.elementIndex}`;

            const uploadUrlResponse = await fetch(
              `/api/public/forms/${slug}/signatures/upload-url`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  questionKey,
                  responseId,
                  contentType: blob.type,
                  byteSize: blob.size,
                }),
              },
            );
            const uploadUrlJson = await uploadUrlResponse.json().catch(() => null);

            if (!uploadUrlResponse.ok) {
              throw new Error(uploadUrlJson?.error || "Failed to prepare signature upload.");
            }

            const uploadPayload = uploadUrlJson as UploadUrlPayload;
            const { error: uploadError } = await supabase.storage
              .from("signatures")
              .uploadToSignedUrl(uploadPayload.path, uploadPayload.token, blob, {
                contentType: "image/png",
                upsert: false,
              });

            if (uploadError) {
              throw new Error(uploadError.message || "Failed to upload signature.");
            }

            signaturePathByQuestionKey.set(questionKey, uploadPayload.path);
          }

          const normalizedPayload = {
            responses: payload.responses.map((response) => {
              const questionKey =
                typeof response.id === "string"
                  ? response.id
                  : `page-${response.pageIndex}-element-${response.elementIndex}`;

              return {
                ...response,
                answer:
                  response.type === "signature"
                    ? signaturePathByQuestionKey.get(questionKey) || null
                    : response.type === "file_upload"
                    ? null
                    : response.answer,
              };
            }),
          };

          const response = await fetch(`/api/public/forms/${slug}/responses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(normalizedPayload),
          });

          const json = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(json?.error || "Failed to submit response.");
          }

          setSubmitted(true);
          toast.success("Response submitted.");
        }}
      />
    </div>
  );
}
