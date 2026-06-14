import Link from "next/link";
import { getNewsrooms, getEditions } from "@/lib/data";
import { toggleNewsroomPublic } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function EditionsPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string }>;
}) {
  const { n } = await searchParams;
  const rooms = await getNewsrooms();
  if (rooms.length === 0) {
    return <p className="text-sm text-paper-300">Found a newsroom first.</p>;
  }
  const room = rooms.find((r) => r.id === n) ?? rooms[0];
  const editions = await getEditions(room.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink-700 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-paper-50">Editions</h2>
          <p className="text-sm text-paper-300">
            Drafts become published articles once you sign off.
          </p>
        </div>
        <form action={toggleNewsroomPublic} className="text-right">
          <input type="hidden" name="newsroomId" value={room.id} />
          <input
            type="hidden"
            name="isPublic"
            value={String(room.is_public)}
          />
          <button className="rounded border border-ink-600 px-3 py-1.5 text-xs text-paper-300 hover:text-paper-50">
            {room.is_public
              ? "Public front page: on"
              : "Public front page: off"}
          </button>
          {room.is_public && (
            <div className="mt-1 text-[11px] text-paper-500">
              <Link
                href={`/read/${room.slug}`}
                className="text-brass-400 hover:text-brass"
              >
                /read/{room.slug}
              </Link>
            </div>
          )}
        </form>
      </div>

      {editions.length === 0 ? (
        <p className="text-sm text-paper-300">No editions yet.</p>
      ) : (
        <ul className="divide-y divide-ink-800 rounded-lg border border-ink-700">
          {editions.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div>
                <Link
                  href={`/editions/${e.id}`}
                  className="font-serif text-lg text-paper-100 hover:text-paper-50"
                >
                  {e.title}
                </Link>
                <div className="text-[11px] text-paper-500">
                  {new Date(e.created_at).toLocaleString("en-AU")}
                </div>
              </div>
              <StatusTag status={e.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "border-ink-600 text-paper-300",
    in_review: "border-amber-500/50 text-amber-300",
    published: "border-brass-600 text-brass-400",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${
        map[status] ?? "border-ink-600 text-paper-300"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
