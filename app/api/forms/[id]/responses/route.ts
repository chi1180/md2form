import { NextResponse } from "next/server";
import { requireFormOwner, requireUser } from "@/lib/api";
import { buildQuestionMetaMap } from "@/lib/forms";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

interface Params {
  params: Promise<{ id: string }>;
}

function isSignaturePath(value: unknown): value is string {
  return typeof value === "string" && value.split("/").length >= 3;
}

function shouldReplaceTitleWithMeta(currentTitle: unknown, questionKey: string) {
  if (typeof currentTitle !== "string") {
    return true;
  }

  const trimmed = currentTitle.trim();
  if (trimmed.length === 0) {
    return true;
  }

  if (/^Question\s+\d+$/i.test(trimmed)) {
    return true;
  }

  if (trimmed === questionKey) {
    return true;
  }

  if (/^page-\d+-element-\d+$/.test(trimmed)) {
    return true;
  }

  return false;
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

  const { data: form } = await supabase
    .from("forms")
    .select("schema_json")
    .eq("id", id)
    .single();
  const questionMetaMap = buildQuestionMetaMap(form?.schema_json);

  const { data, error } = await supabase
    .from("responses")
    .select("id,submitted_at,answers_json,metadata")
    .eq("form_id", id)
    .order("submitted_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const serviceRole = createSupabaseServiceRoleClient();

  const hydrated = await Promise.all(
    (data || []).map(async (response) => {
      const answers = Array.isArray(response.answers_json)
        ? response.answers_json
        : [];

      const resolvedAnswers = await Promise.all(
        answers.map(async (answer) => {
          const item = answer as Record<string, unknown>;
          if (item.question_type === "section_header") {
            return null;
          }

          if (item.question_type !== "signature" || !isSignaturePath(item.answer)) {
            return answer;
          }

          const meta =
            typeof item.question_key === "string"
              ? questionMetaMap.get(item.question_key)
              : null;

          const { data: signed } = await serviceRole.storage
            .from("signatures")
            .createSignedUrl(item.answer, 60 * 60);

          return {
            ...item,
            title:
              meta && shouldReplaceTitleWithMeta(item.title, String(item.question_key))
                ? meta.title
                : item.title,
            signed_url: signed?.signedUrl || null,
          };
        }),
      );

      const filteredAnswers = resolvedAnswers.filter((answer) => answer !== null);

      const withTitles = filteredAnswers.map((answer) => {
        const item = answer as Record<string, unknown>;
        if (typeof item.question_key !== "string") {
          return answer;
        }

        if (!shouldReplaceTitleWithMeta(item.title, item.question_key)) {
          return answer;
        }

        const meta = questionMetaMap.get(item.question_key);
        return {
          ...item,
          title: meta?.title || item.title || item.question_key,
          _order: meta?.order ?? Number.MAX_SAFE_INTEGER,
        };
      });

      withTitles.sort((a, b) => {
        const left = a as Record<string, unknown>;
        const right = b as Record<string, unknown>;
        const leftOrder =
          typeof left._order === "number" ? left._order : Number.MAX_SAFE_INTEGER;
        const rightOrder =
          typeof right._order === "number" ? right._order : Number.MAX_SAFE_INTEGER;

        return leftOrder - rightOrder;
      });

      return {
        ...response,
        answers_json: withTitles.map((item) => {
          const answer = item as Record<string, unknown>;
          const rest = { ...answer };
          delete rest._order;
          return rest;
        }),
      };
    }),
  );

  return NextResponse.json({ responses: hydrated });
}
