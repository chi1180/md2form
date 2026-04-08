import { NextResponse } from "next/server";
import { requireFormOwner, requireUser } from "@/lib/api";
import { buildQuestionMetaMap } from "@/lib/forms";

interface Params {
  params: Promise<{ id: string }>;
}

const CHOICE_TYPES = ["radio", "dropdown", "checkbox", "boolean", "rating", "scale"];

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

  const [responses, byQuestion, numericStats] = await Promise.all([
    supabase
      .from("responses")
      .select("submitted_at")
      .eq("form_id", id)
      .order("submitted_at", { ascending: true })
      .limit(5000),
    supabase
      .from("response_items")
      .select("question_key,question_type,value_text,value_json")
      .eq("form_id", id)
      .in("question_type", CHOICE_TYPES)
      .limit(5000),
    supabase
      .from("response_items")
      .select("question_key,question_type,value_number")
      .eq("form_id", id)
      .in("question_type", ["number", "rating", "scale"])
      .limit(5000),
  ]);

  if (responses.error || byQuestion.error || numericStats.error) {
    return NextResponse.json(
      {
        error:
          responses.error?.message ||
          byQuestion.error?.message ||
          numericStats.error?.message,
      },
      { status: 500 },
    );
  }

  const timelineMap = new Map<string, number>();
  (responses.data || []).forEach((row) => {
    const day = new Date(row.submitted_at).toISOString().slice(0, 10);
    timelineMap.set(day, (timelineMap.get(day) || 0) + 1);
  });

  const distribution = new Map<string, {
    question_key: string;
    question_title: string;
    question_type: string;
    options: string[];
    order: number;
    counts: Map<string, number>;
  }>();

  (byQuestion.data || []).forEach((row) => {
    const key = row.question_key;
    const type = row.question_type;
    const meta = questionMetaMap.get(key);
    const combinedKey = `${key}:${type}`;

    if (!distribution.has(combinedKey)) {
      distribution.set(combinedKey, {
        question_key: key,
        question_title: meta?.title || key,
        question_type: type,
        options: meta?.options || [],
        order: meta?.order ?? Number.MAX_SAFE_INTEGER,
        counts: new Map<string, number>(),
      });
    }

    const bucket = distribution.get(combinedKey)!;

    if (type === "checkbox" && Array.isArray(row.value_json)) {
      row.value_json.forEach((v) => {
        const label = typeof v === "string" ? v : JSON.stringify(v);
        bucket.counts.set(label, (bucket.counts.get(label) || 0) + 1);
      });
      return;
    }

    if (type === "boolean" && typeof row.value_json === "boolean") {
      const label = row.value_json ? "true" : "false";
      bucket.counts.set(label, (bucket.counts.get(label) || 0) + 1);
      return;
    }

    const label = row.value_text || "(empty)";
    bucket.counts.set(label, (bucket.counts.get(label) || 0) + 1);
  });

  const numeric = new Map<string, {
    question_key: string;
    question_title: string;
    question_type: string;
    order: number;
    min: number;
    max: number;
    sum: number;
    count: number;
  }>();
  (numericStats.data || []).forEach((row) => {
    if (typeof row.value_number !== "number") {
      return;
    }

    const key = `${row.question_key}:${row.question_type}`;
    const meta = questionMetaMap.get(row.question_key);
    if (!numeric.has(key)) {
      numeric.set(key, {
        question_key: row.question_key,
        question_title: meta?.title || row.question_key,
        question_type: row.question_type,
        order: meta?.order ?? Number.MAX_SAFE_INTEGER,
        min: row.value_number,
        max: row.value_number,
        sum: row.value_number,
        count: 1,
      });
      return;
    }

    const stat = numeric.get(key)!;
    stat.min = Math.min(stat.min, row.value_number);
    stat.max = Math.max(stat.max, row.value_number);
    stat.sum += row.value_number;
    stat.count += 1;
  });

  return NextResponse.json({
    total_responses: (responses.data || []).length,
    timeline: Array.from(timelineMap.entries()).map(([day, count]) => ({
      day,
      count,
    })),
    distribution: Array.from(distribution.values())
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        question_key: item.question_key,
        question_title: item.question_title,
        question_type: item.question_type,
        values: (() => {
          const existing = Array.from(item.counts.entries()).map(([label, count]) => ({
            label,
            count,
          }));
          const optionSet = new Set(existing.map((entry) => entry.label));

          item.options.forEach((option) => {
            if (!optionSet.has(option)) {
              existing.push({ label: option, count: 0 });
            }
          });

          const optionOrder = new Map(item.options.map((option, index) => [option, index]));
          return existing.sort((a, b) => {
            const aHasOrder = optionOrder.has(a.label);
            const bHasOrder = optionOrder.has(b.label);

            if (aHasOrder && bHasOrder) {
              return optionOrder.get(a.label)! - optionOrder.get(b.label)!;
            }

            if (aHasOrder) {
              return -1;
            }

            if (bHasOrder) {
              return 1;
            }

            return b.count - a.count;
          });
        })(),
      })),
    numeric: Array.from(numeric.values())
      .sort((a, b) => a.order - b.order)
      .map((stat) => ({
        question_key: stat.question_key,
        question_title: stat.question_title,
        question_type: stat.question_type,
        min: stat.min,
        max: stat.max,
        avg: stat.sum / stat.count,
        count: stat.count,
      })),
  });
}
