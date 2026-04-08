import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizePublicSchema } from "@/lib/public-form";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const supabase = await createSupabaseServerClient();
  const { slug } = await params;

  const { data, error } = await supabase
    .from("forms")
    .select(
      "id,title,description,schema_json,is_public,accepting_responses,public_slug,response_limit,response_count",
    )
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({
    form: {
      ...data,
      schema_json: sanitizePublicSchema(data.schema_json),
    },
  });
}
