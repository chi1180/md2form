"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { PublicFormView } from "@/components/forms/public-form-view";

export default function PublicFormPage() {
  return (
    <Suspense fallback={null}>
      <PublicFormPageInner />
    </Suspense>
  );
}

function PublicFormPageInner() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  if (!slug) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        <PublicFormView slug={slug} />
      </div>
    </main>
  );
}
