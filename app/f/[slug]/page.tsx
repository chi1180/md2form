"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { PageLoading } from "@/components/page-loading";
import { PublicFormView } from "@/components/forms/public-form-view";

export default function PublicFormPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading form..." />}>
      <PublicFormPageInner />
    </Suspense>
  );
}

function PublicFormPageInner() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  if (!slug) {
    return <PageLoading message="Loading form..." />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        <PublicFormView slug={slug} />
      </div>
    </main>
  );
}
