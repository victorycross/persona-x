import { createClient } from "@/lib/supabase/server";
import { renderMarkdown } from "@/components/Markdown";
import { slugify } from "@/lib/slug";
import type { Edition } from "@/lib/types";

/**
 * GET /api/editions/:id/export?format=md|html — download an edition.
 * The editor owns the artefact and can take it anywhere.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = new URL(req.url).searchParams.get("format") === "html" ? "html" : "md";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Not signed in", { status: 401 });

  const { data: edition } = await supabase
    .from("editions")
    .select("*")
    .eq("id", id)
    .single<Edition>();
  if (!edition) return new Response("Not found", { status: 404 });

  const base = slugify(edition.title) || "edition";
  const body = edition.body ?? "";

  if (format === "html") {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${edition.title}</title></head><body style="max-width:680px;margin:40px auto;font-family:Georgia,serif;line-height:1.6">${renderMarkdown(
      body
    )}</body></html>`;
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.html"`,
      },
    });
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${base}.md"`,
    },
  });
}
