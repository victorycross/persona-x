"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { DEFAULT_MODEL } from "@/lib/pricing";

/** Found a new newsroom and seed it with two starter beats. */
export async function createNewsroom(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const masthead = String(formData.get("masthead") ?? "").trim() || null;
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
  const { data: room } = await supabase
    .from("newsrooms")
    .insert({ owner_id: user.id, name, masthead, slug })
    .select("id")
    .single();

  if (room) {
    await supabase.from("beats").insert([
      {
        newsroom_id: room.id,
        name: "Sector watch",
        brief:
          "Significant developments in our sector and among direct competitors.",
        recency_days: 7,
        significance_floor: "medium",
        model: DEFAULT_MODEL,
      },
      {
        newsroom_id: room.id,
        name: "Policy & regulation",
        brief: "New policy, regulation, or official guidance affecting us.",
        recency_days: 14,
        significance_floor: "medium",
        model: DEFAULT_MODEL,
      },
    ]);
  }

  revalidatePath("/");
  redirect("/newsroom");
}

/** Hire a desk for a new beat. */
export async function createBeat(formData: FormData) {
  const newsroomId = String(formData.get("newsroomId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const brief = String(formData.get("brief") ?? "").trim();
  if (!newsroomId || !name || !brief) return;

  const supabase = await createClient();
  await supabase.from("beats").insert({
    newsroom_id: newsroomId,
    name,
    brief,
    recency_days: Number(formData.get("recency_days") ?? 7),
    significance_floor: String(formData.get("significance_floor") ?? "medium"),
    model: String(formData.get("model") ?? DEFAULT_MODEL),
  });
  revalidatePath("/newsroom");
}

export async function toggleBeat(formData: FormData) {
  const id = String(formData.get("beatId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("beats").update({ active: !active }).eq("id", id);
  revalidatePath("/newsroom");
}

/** Spike a filing — pull it from the wire so it won't reach an edition. */
export async function spikeFiling(formData: FormData) {
  const id = String(formData.get("filingId") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("filings").update({ status: "spiked" }).eq("id", id);
  revalidatePath("/wire");
}

/** Toggle whether a newsroom's published editions are publicly readable. */
export async function toggleNewsroomPublic(formData: FormData) {
  const id = String(formData.get("newsroomId") ?? "");
  const isPublic = String(formData.get("isPublic") ?? "") === "true";
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("newsrooms").update({ is_public: !isPublic }).eq("id", id);
  revalidatePath("/editions");
}
