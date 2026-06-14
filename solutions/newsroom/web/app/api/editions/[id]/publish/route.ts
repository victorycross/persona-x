import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiErrorResponse } from "@/lib/api-error";

/**
 * POST /api/editions/:id/publish — the Editor-in-Chief signs off. This is the
 * human-in-the-loop gate: nothing reaches an audience until this fires.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { data: edition, error } = await supabase
      .from("editions")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        signed_off_by: user.id,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error || !edition) {
      return NextResponse.json(
        { error: "Could not publish edition" },
        { status: 500 }
      );
    }

    return NextResponse.json({ edition });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
