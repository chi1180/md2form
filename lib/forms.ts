export interface FormRecord {
  id: string;
  owner_user_id: string;
  title: string;
  description: string | null;
  markdown_source: string;
  schema_json: unknown;
  is_public: boolean;
  accepting_responses: boolean;
  public_slug: string | null;
  response_limit: number | null;
  response_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicFormRecord {
  id: string;
  title: string;
  description: string | null;
  schema_json: unknown;
  is_public: boolean;
  accepting_responses: boolean;
  public_slug: string;
  response_limit: number | null;
  response_count: number;
}

export interface SubmittedResponseItem {
  pageIndex: number;
  elementIndex: number;
  type: string;
  answer: unknown;
  id?: string;
  title?: string;
}

export interface NormalizedResponseItem {
  question_key: string;
  question_type: string;
  answer: unknown;
  page_index: number;
  element_index: number;
  title: string;
}

export interface QuestionMeta {
  key: string;
  title: string;
  type: string;
  options: string[];
  order: number;
}

export function createPublicSlug() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";

  for (let i = 0; i < 12; i += 1) {
    slug += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return slug;
}

export function toQuestionKey(item: SubmittedResponseItem) {
  return item.id || `page-${item.pageIndex}-element-${item.elementIndex}`;
}

export function toStorageQuestionKey(questionKey: string) {
  return questionKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export function normalizeResponseItems(items: SubmittedResponseItem[]) {
  return items.map<NormalizedResponseItem>((item) => ({
    question_key: toQuestionKey(item),
    question_type: item.type,
    answer: item.answer,
    page_index: item.pageIndex,
    element_index: item.elementIndex,
    title: item.title || `Question ${item.elementIndex + 1}`,
  }));
}

export function toResponseItemStorageValue(answer: unknown) {
  if (answer === null || typeof answer === "undefined") {
    return {
      value_text: null,
      value_number: null,
      value_json: null,
    };
  }

  if (typeof answer === "string") {
    const asNumber = Number(answer);
    return {
      value_text: answer,
      value_number: Number.isFinite(asNumber) ? asNumber : null,
      value_json: null,
    };
  }

  if (typeof answer === "number") {
    return {
      value_text: String(answer),
      value_number: answer,
      value_json: null,
    };
  }

  if (typeof answer === "boolean") {
    return {
      value_text: answer ? "true" : "false",
      value_number: null,
      value_json: answer,
    };
  }

  return {
    value_text: null,
    value_number: null,
    value_json: answer,
  };
}

export function buildQuestionMetaMap(schema: unknown) {
  const map = new Map<string, QuestionMeta>();

  if (!schema || typeof schema !== "object") {
    return map;
  }

  const pages = (schema as { pages?: unknown }).pages;
  if (!Array.isArray(pages)) {
    return map;
  }

  pages.forEach((page, pageIndex) => {
    if (!page || typeof page !== "object") {
      return;
    }

    const elements = (page as { elements?: unknown }).elements;
    if (!Array.isArray(elements)) {
      return;
    }

    elements.forEach((element, elementIndex) => {
      if (!element || typeof element !== "object") {
        return;
      }

      const record = element as {
        id?: unknown;
        title?: unknown;
        description?: unknown;
        type?: unknown;
        options?: unknown;
      };

      const key =
        typeof record.id === "string" && record.id.length > 0
          ? record.id
          : `page-${pageIndex}-element-${elementIndex}`;

      const titleCandidates = [record.title, record.description];
      const foundTitle = titleCandidates.find(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      );
      const title = foundTitle || `Question ${elementIndex + 1}`;

      const options = Array.isArray(record.options)
        ? record.options.filter((value): value is string => typeof value === "string")
        : [];

      map.set(key, {
        key,
        title,
        type: typeof record.type === "string" ? record.type : "unknown",
        options,
        order: pageIndex * 10_000 + elementIndex,
      });
    });
  });

  return map;
}
