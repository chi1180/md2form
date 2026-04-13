import { NextResponse } from "next/server";
import {
  normalizeResponseItems,
  toStorageQuestionKey,
  toQuestionKey,
  toResponseItemStorageValue,
  type SubmittedResponseItem,
} from "@/lib/forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { dataUrlToBuffer } from "@/lib/public-form";

interface Params {
  params: Promise<{ slug: string }>;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimitByIpAndSlug = new Map<string, number[]>();

function extractSignatureAnswers(items: SubmittedResponseItem[]) {
  return items.filter(
    (item) =>
      item.type === "signature" &&
      typeof item.answer === "string" &&
      item.answer.startsWith("data:image/png;base64,"),
  );
}

function extractIP(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) {
    return "unknown";
  }

  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string, slug: string) {
  const key = `${ip}:${slug}`;
  const now = Date.now();
  const existing = rateLimitByIpAndSlug.get(key) || [];
  const activeWindow = existing.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (activeWindow.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitByIpAndSlug.set(key, activeWindow);
    return true;
  }

  activeWindow.push(now);
  rateLimitByIpAndSlug.set(key, activeWindow);
  return false;
}

function isStorageSignaturePath(value: unknown, formId: string) {
  if (typeof value !== "string") {
    return false;
  }

  const parts = value.split("/");
  if (parts.length < 3) {
    return false;
  }

  if (parts[0] !== formId) {
    return false;
  }

  return value.toLowerCase().endsWith(".png");
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const ip = extractIP(request);
  if (isRateLimited(ip, slug)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait and try again." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.responses)) {
    return NextResponse.json(
      { error: "responses are required" },
      { status: 400 },
    );
  }

  const submittedResponses = body.responses as SubmittedResponseItem[];
  const supabase = await createSupabaseServerClient();

  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id,is_public,accepting_responses,response_limit,response_count")
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

  if (
    typeof form.response_limit === "number" &&
    form.response_count >= form.response_limit
  ) {
    return NextResponse.json(
      { error: "Response limit reached." },
      { status: 400 },
    );
  }

  const normalized = normalizeResponseItems(submittedResponses);
  const metadata = {
    ip,
    userAgent: request.headers.get("user-agent") || "unknown",
  };

  const { data: insertedResponse, error: responseError } = await supabase
    .from("responses")
    .insert({
      form_id: form.id,
      answers_json: normalized,
      metadata,
    })
    .select("id")
    .single();

  if (responseError || !insertedResponse) {
    return NextResponse.json(
      { error: responseError?.message || "Failed to save response" },
      { status: 500 },
    );
  }

  const serviceRole = createSupabaseServiceRoleClient();
  const signatureItems = extractSignatureAnswers(submittedResponses);
  const signaturePathByKey = new Map<string, string>();

  for (const item of submittedResponses) {
    if (item.type !== "signature") {
      continue;
    }

    const questionKey = toQuestionKey(item);
    if (
      typeof item.answer === "string" &&
      isStorageSignaturePath(item.answer, form.id)
    ) {
      signaturePathByKey.set(questionKey, item.answer);
    }
  }

  for (const item of signatureItems) {
    if (typeof item.answer !== "string") {
      continue;
    }

    const parsed = dataUrlToBuffer(item.answer);
    if (!parsed || parsed.mime !== "image/png") {
      continue;
    }

    if (parsed.buffer.byteLength > 2 * 1024 * 1024) {
      continue;
    }

    const questionKey = toQuestionKey(item);
    const storageQuestionKey =
      toStorageQuestionKey(questionKey) || `q-${item.elementIndex}`;
    const objectPath = `${form.id}/${insertedResponse.id}/${storageQuestionKey}.png`;

    if (objectPath.includes("..")) {
      throw new Error("Invalid file path");
    }

    const { error: uploadError } = await serviceRole.storage
      .from("signatures")
      .upload(objectPath, parsed.buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (!uploadError) {
      signaturePathByKey.set(questionKey, objectPath);
    }
  }

  const responseItemsToInsert = normalized.map((item) => {
    let answer: unknown;

    if (item.question_type === "signature") {
      answer = signaturePathByKey.get(item.question_key) || null;
    } else if (item.question_type === "file_upload") {
      answer = null;
    } else {
      answer = item.answer;
    }

    const storageValue = toResponseItemStorageValue(answer);

    return {
      response_id: insertedResponse.id,
      form_id: form.id,
      question_key: item.question_key,
      question_type: item.question_type,
      ...storageValue,
    };
  });

  const sanitizedAnswers = normalized.map((item) => ({
    ...item,
    answer: (() => {
      if (item.question_type === "signature") {
        return signaturePathByKey.get(item.question_key) || null;
      }

      if (item.question_type === "file_upload") {
        return null;
      }

      return item.answer;
    })(),
  }));

  await supabase
    .from("responses")
    .update({ answers_json: sanitizedAnswers })
    .eq("id", insertedResponse.id);

  const { error: responseItemsError } = await supabase
    .from("response_items")
    .insert(responseItemsToInsert);

  if (responseItemsError) {
    return NextResponse.json(
      { error: responseItemsError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
