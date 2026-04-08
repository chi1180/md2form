"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FormDetailTabs } from "@/components/forms/form-detail-tabs";

type TabKey = "questions" | "responses" | "settings";

function toTabKey(value: string | null): TabKey {
  if (value === "responses" || value === "settings") {
    return value;
  }

  return "questions";
}

export default function FormDetailPage() {
  return (
    <Suspense fallback={null}>
      <FormDetailPageInner />
    </Suspense>
  );
}

function FormDetailPageInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const formId = params.id;

  if (!formId) {
    return null;
  }

  const tab = toTabKey(searchParams.get("tab"));
  return <FormDetailTabs formId={formId} tab={tab} />;
}
