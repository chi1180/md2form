import { NextResponse } from "next/server";
import { parseMarkdownToForm } from "md2form";
import { createPublicSlug } from "@/lib/forms";
import { badRequest, requireFormOwner, requireUser } from "@/lib/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { supabase, unauthorized } = await requireUser();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await params;
  const forbidden = await requireFormOwner(supabase, id);
  if (forbidden) {
    return forbidden;
  }

  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ form: data });
}

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, unauthorized } = await requireUser();
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return badRequest("invalid payload");
  }

  const { id } = await params;
  const forbidden = await requireFormOwner(supabase, id);
  if (forbidden) {
    return forbidden;
  }

  const updatePayload: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    updatePayload.title = body.title;
  }

  if (typeof body.description === "string" || body.description === null) {
    updatePayload.description = body.description;
  }

  if (typeof body.acceptingResponses === "boolean") {
    updatePayload.accepting_responses = body.acceptingResponses;
  }

  if (
    typeof body.responseLimit === "number" ||
    body.responseLimit === null ||
    typeof body.responseLimit === "undefined"
  ) {
    if (typeof body.responseLimit === "number") {
      updatePayload.response_limit = Math.max(0, Math.floor(body.responseLimit));
    } else {
      updatePayload.response_limit = null;
    }
  }

  if (body.regeneratePublicSlug === true) {
    updatePayload.public_slug = createPublicSlug();
  }

  if (typeof body.isPublic === "boolean") {
    updatePayload.is_public = body.isPublic;
    if (body.isPublic) {
      updatePayload.accepting_responses = body.acceptingResponses ?? true;
      updatePayload.public_slug =
        typeof updatePayload.public_slug === "string"
          ? updatePayload.public_slug
          : createPublicSlug();
      updatePayload.published_at = new Date().toISOString();
    } else {
      updatePayload.accepting_responses = false;
      updatePayload.public_slug = null;
      updatePayload.published_at = null;
    }
  }

  if (typeof body.markdown === "string") {
    try {
      const parsed = await parseMarkdownToForm(body.markdown);
      updatePayload.markdown_source = body.markdown;
      updatePayload.schema_json = parsed;

      if (typeof body.title !== "string") {
        const parsedRecord = parsed as Record<string, unknown>;
        if (typeof parsedRecord.title === "string") {
          updatePayload.title = parsedRecord.title;
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to parse markdown";
      return badRequest(message);
    }
  }

  const { data, error } = await supabase
    .from("forms")
    .update(updatePayload)
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Failed to update form" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
