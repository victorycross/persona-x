import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { Newsroom } from "@/lib/types";

/**
 * POST /api/subscribe { slug, email } — public subscribe to a public newsroom.
 * Uses the service client (validated server-side) so signed-out readers can
 * subscribe without exposing insert RLS to anon.
 */
export async function POST(req: Request) {
  const { slug, email } = (await req.json().catch(() => ({}))) as {
    slug?: string;
    email?: string;
  };
  const addr = (email ?? "").trim().toLowerCase();
  if (!slug || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { data: room } = await supabase
    .from("newsrooms")
    .select("id, is_public")
    .eq("slug", slug)
    .single<Pick<Newsroom, "id"> & { is_public: boolean }>();
  if (!room || !room.is_public) {
    return NextResponse.json(
      { error: "This newsroom is not accepting subscribers." },
      { status: 404 }
    );
  }

  const { error } = await supabase
    .from("subscribers")
    .upsert(
      { newsroom_id: room.id, email: addr, status: "active" },
      { onConflict: "newsroom_id,email" }
    );
  if (error) {
    return NextResponse.json(
      { error: "Could not subscribe. Please try again." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
