import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { runDesk } from "@/lib/desk-engine";
import { assembleEdition, editionTitleFor } from "@/lib/wire-editor";
import { slugify } from "@/lib/slug";
import type { Beat, Filing, Newsroom } from "@/lib/types";

export const maxDuration = 300;

/**
 * Scheduled auto-editions. Vercel Cron hits this on the print cycle (Morning /
 * Afternoon / Final). For every newsroom, every active desk researches its beat
 * and files to the wire; then a DRAFT edition is assembled and left for the
 * Editor-in-Chief to sign off. Nothing is published automatically.
 *
 * Authenticated by the CRON_SECRET header (Vercel sends it as a Bearer token).
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: newsrooms } = await supabase
    .from("newsrooms")
    .select("*")
    .returns<Newsroom[]>();

  const summary: { newsroom: string; filed: number; edition: string }[] = [];

  for (const room of newsrooms ?? []) {
    const { data: beats } = await supabase
      .from("beats")
      .select("*")
      .eq("newsroom_id", room.id)
      .eq("active", true)
      .returns<Beat[]>();

    let filed = 0;
    for (const beat of beats ?? []) {
      try {
        const { filings, usage } = await runDesk(beat);
        if (filings.length > 0) {
          const rows = filings.map((f) => ({
            newsroom_id: room.id,
            beat_id: beat.id,
            beat_name: beat.name,
            headline: f.headline,
            summary: f.summary,
            source: f.source,
            url: f.url,
            official: f.official,
            significance: f.significance,
            published_at: f.published_at,
          }));
          const { data: inserted, error: insertErr } = await supabase
            .from("filings")
            .upsert(rows, {
              onConflict: "newsroom_id,url",
              ignoreDuplicates: true,
            })
            .select("id");
          if (insertErr) {
            console.error(
              `Filing insert failed for ${beat.name} in ${room.name}:`,
              insertErr
            );
          }
          filed += inserted?.length ?? 0;
        }
        await supabase.from("desk_runs").insert({
          newsroom_id: room.id,
          beat_id: beat.id,
          model: beat.model,
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          filed_count: filings.length,
        });
      } catch (err) {
        console.error(`Desk ${beat.name} failed in ${room.name}:`, err);
      }
    }

    // Assemble a draft edition from the fresh wire.
    const { data: wire } = await supabase
      .from("filings")
      .select("*")
      .eq("newsroom_id", room.id)
      .in("status", ["new", "filed"])
      .is("edition_id", null)
      .returns<Filing[]>();

    const items = wire ?? [];
    const title = editionTitleFor();
    const body = assembleEdition(title, items);
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    const { data: edition } = await supabase
      .from("editions")
      .insert({ newsroom_id: room.id, title, slug, status: "draft", body })
      .select("id")
      .single();

    if (edition && items.length > 0) {
      await supabase
        .from("filings")
        .update({ status: "filed", edition_id: edition.id })
        .in(
          "id",
          items.map((f) => f.id)
        );
    }

    summary.push({ newsroom: room.name, filed, edition: title });
  }

  return NextResponse.json({ ran: summary.length, summary });
}
