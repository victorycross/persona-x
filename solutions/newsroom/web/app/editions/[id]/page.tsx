import Link from "next/link";
import { notFound } from "next/navigation";
import { getEdition } from "@/lib/data";
import Markdown from "@/components/Markdown";
import RunButton from "@/components/RunButton";
import type { BoardReview } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const edition = await getEdition(id);
  if (!edition) notFound();

  const review = edition.board_review as BoardReview | null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <article>
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/editions"
            className="text-xs text-paper-400 hover:text-paper-100"
          >
            ← Editions
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-brass-600">
            {edition.status.replace("_", " ")}
          </span>
        </div>
        {edition.body ? (
          <Markdown source={edition.body} />
        ) : (
          <p className="text-sm text-paper-300">This edition is empty.</p>
        )}
      </article>

      <aside className="space-y-5">
        <div className="rounded-lg border border-ink-700 bg-ink-900/40 p-4">
          <h3 className="mb-2 text-xs uppercase tracking-widest text-brass-400">
            Editorial desk
          </h3>
          <div className="space-y-2">
            {edition.status !== "published" && (
              <RunButton
                endpoint={`/api/editions/${edition.id}/review`}
                idle="Convene the board"
                busy="The board is reading…"
                done={(d) =>
                  `Consensus: ${
                    (d as { review: BoardReview }).review.consensus
                  }.`
                }
                className="w-full rounded-md border border-ink-600 px-3 py-2 text-sm text-paper-200 hover:border-brass-600 hover:text-brass-400 disabled:opacity-50"
              />
            )}
            {edition.status !== "published" ? (
              <RunButton
                endpoint={`/api/editions/${edition.id}/publish`}
                idle="Sign off & publish"
                busy="Publishing…"
                done={() => "Published."}
                className="w-full rounded-md border border-brass-600 bg-brass-600/10 px-3 py-2 text-sm font-medium text-brass-400 hover:bg-brass-600/20 disabled:opacity-50"
              />
            ) : (
              <p className="text-sm text-paper-300">
                Signed off
                {edition.published_at
                  ? ` ${new Date(edition.published_at).toLocaleString("en-AU")}`
                  : ""}
                .
              </p>
            )}
          </div>
        </div>

        {review && (
          <div className="rounded-lg border border-ink-700 bg-ink-900/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest text-brass-400">
                The board
              </h3>
              <span className="text-[10px] uppercase tracking-wide text-paper-400">
                consensus: {review.consensus}
              </span>
            </div>
            <ul className="space-y-3">
              {review.verdicts.map((v) => (
                <li key={v.persona} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-paper-100">
                      {v.persona}
                    </span>
                    <VerdictTag v={v.verdict} />
                  </div>
                  <p className="mt-0.5 text-xs text-paper-300">{v.rationale}</p>
                  {v.flags.length > 0 && (
                    <ul className="mt-1 list-inside list-disc text-[11px] text-amber-300/80">
                      {v.flags.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

function VerdictTag({ v }: { v: "publish" | "hold" | "revise" }) {
  const map = {
    publish: "text-brass-400",
    hold: "text-red-300",
    revise: "text-amber-300",
  } as const;
  return (
    <span className={`text-[10px] uppercase tracking-wide ${map[v]}`}>{v}</span>
  );
}
