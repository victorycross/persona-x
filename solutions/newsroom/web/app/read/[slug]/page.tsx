import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Markdown from "@/components/Markdown";
import type { Edition, Newsroom } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Public front page for a newsroom (syndication). Shows only PUBLISHED editions
 * of a PUBLIC newsroom — enforced by RLS, so this works for signed-out readers.
 */
export default async function ReadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("newsrooms")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single<Newsroom>();
  if (!room) notFound();

  const { data: editions } = await supabase
    .from("editions")
    .select("*")
    .eq("newsroom_id", room.id)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .returns<Edition[]>();

  const list = editions ?? [];

  return (
    <div className="space-y-10">
      <header className="border-b border-ink-700 pb-5 text-center">
        <h1 className="font-serif text-4xl text-paper-50">{room.name}</h1>
        {room.masthead && (
          <p className="mt-1 text-sm text-paper-300">{room.masthead}</p>
        )}
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-brass-600">
          Published editions
        </p>
      </header>

      {list.length === 0 ? (
        <p className="text-center text-sm text-paper-300">
          No published editions yet.
        </p>
      ) : (
        <div className="space-y-12">
          {list.map((e) => (
            <article
              key={e.id}
              className="border-b border-ink-800 pb-10 last:border-0"
            >
              <p className="mb-2 text-[11px] uppercase tracking-widest text-paper-500">
                {e.published_at
                  ? new Date(e.published_at).toLocaleDateString("en-AU", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </p>
              {e.body && <Markdown source={e.body} />}
            </article>
          ))}
        </div>
      )}

      <footer className="border-t border-ink-800 pt-5 text-center text-xs text-paper-500">
        <Link href={`/read/${room.slug}/rss`} className="hover:text-brass-400">
          RSS feed
        </Link>
      </footer>
    </div>
  );
}
