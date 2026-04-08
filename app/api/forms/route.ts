import { NextResponse } from "next/server";
import { parseMarkdownToForm } from "md2form";
import { createPublicSlug } from "@/lib/forms";
import { requireUser, badRequest } from "@/lib/api";
import { getFormLimitByPlan } from "@/lib/plans";

export async function GET() {
  const { supabase, planTier, unauthorized } = await requireUser();
  if (unauthorized) {
    return unauthorized;
  }

  const { data, error } = await supabase
    .from("forms")
    .select(
      "id,title,description,is_public,accepting_responses,public_slug,response_count,response_limit,updated_at,created_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    forms: data,
    plan_tier: planTier,
    form_limit: getFormLimitByPlan(planTier),
  });
}

export async function POST(request: Request) {
  const { supabase, user, planTier, unauthorized } = await requireUser();
  if (unauthorized || !user) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.markdown !== "string") {
    return badRequest("markdown is required");
  }

  const markdown = body.markdown as string;
  const isPublic = body.isPublic === true;
  const acceptingResponses = body.acceptingResponses !== false;
  const responseLimit =
    typeof body.responseLimit === "number" && Number.isFinite(body.responseLimit)
      ? Math.max(0, Math.floor(body.responseLimit))
      : null;

  const { count, error: countError } = await supabase
    .from("forms")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", user.id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const formLimit = getFormLimitByPlan(planTier);

  if ((count || 0) >= formLimit) {
    return NextResponse.json(
      {
        error: `Plan limit reached. You can create up to ${formLimit} forms on your current plan.`,
        code: "PLAN_FORM_LIMIT_REACHED",
      },
      { status: 403 },
    );
  }

  try {
    const parsed = await parseMarkdownToForm(markdown);
    const parsedRecord = parsed as Record<string, unknown>;
    const title =
      typeof body.title === "string" && body.title.trim().length > 0
        ? body.title.trim()
        : typeof parsedRecord.title === "string"
          ? parsedRecord.title
          : "Untitled Form";

    const description =
      typeof body.description === "string" ? body.description : null;

    const { data, error } = await supabase
      .from("forms")
      .insert({
        owner_user_id: user.id,
        title,
        description,
        markdown_source: markdown,
        schema_json: parsed,
        is_public: isPublic,
        accepting_responses: acceptingResponses,
        public_slug: isPublic ? createPublicSlug() : null,
        response_limit: responseLimit,
        published_at: isPublic ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse markdown";
    return badRequest(message);
  }
}
