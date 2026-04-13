import { NextResponse } from "next/server";
import { toStorageQuestionKey } from "@/lib/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const body = await request.json().catch(() => null);

  const questionKey =
    body && typeof body.questionKey === "string" ? body.questionKey : null;
  const responseId =
    body && typeof body.responseId === "string"
      ? body.responseId
      : crypto.randomUUID();

  if (!questionKey || questionKey.trim().length === 0) {
    return NextResponse.json(
      { error: "questionKey is required" },
      { status: 400 },
    );
  }

  const contentType =
    body && typeof body.contentType === "string"
      ? body.contentType
      : "image/png";
  const byteSize =
    body && typeof body.byteSize === "number" ? body.byteSize : 0;

  if (contentType !== "image/png") {
    return NextResponse.json(
      { error: "Only image/png is supported" },
      { status: 400 },
    );
  }

  if (
    !Number.isFinite(byteSize) ||
    byteSize <= 0 ||
    byteSize > 2 * 1024 * 1024
  ) {
    return NextResponse.json(
      { error: "Signature size must be 1B to 2MB" },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id,is_public,accepting_responses")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (formError || !form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  if (!form.accepting_responses) {
    return NextResponse.json(
      { error: "This form is not accepting responses." },
      { status: 400 },
    );
  }

  const safeQuestionKey = toStorageQuestionKey(questionKey);
  if (!safeQuestionKey) {
    return NextResponse.json(
      { error: "Invalid question key" },
      { status: 400 },
    );
  }

  const objectPath = `${form.id}/${responseId}/${safeQuestionKey}.png`;
  const serviceRole = createSupabaseServiceRoleClient();

  if (objectPath.includes("..")) {
    throw new Error("Invalid file path");
  }

  const { data, error } = await serviceRole.storage
    .from("signatures")
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Failed to create upload URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    path: objectPath,
    token: data.token,
  });
}
