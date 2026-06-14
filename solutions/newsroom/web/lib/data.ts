import { createClient } from "@/lib/supabase/server";
import type { Beat, Edition, Filing, Newsroom } from "@/lib/types";

/**
 * The current user's newsrooms (multi-newsroom workspaces). The first is the
 * "active" one for single-newsroom views until a switcher is added.
 */
export async function getNewsrooms(): Promise<Newsroom[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("newsrooms")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Newsroom[]>();
  return data ?? [];
}

export async function getNewsroom(id: string): Promise<Newsroom | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("newsrooms")
    .select("*")
    .eq("id", id)
    .single<Newsroom>();
  return data ?? null;
}

export async function getBeats(newsroomId: string): Promise<Beat[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("beats")
    .select("*")
    .eq("newsroom_id", newsroomId)
    .order("created_at", { ascending: true })
    .returns<Beat[]>();
  return data ?? [];
}

export async function getWire(newsroomId: string): Promise<Filing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("filings")
    .select("*")
    .eq("newsroom_id", newsroomId)
    .in("status", ["new", "filed"])
    .is("edition_id", null)
    .order("filed_at", { ascending: false })
    .returns<Filing[]>();
  return data ?? [];
}

export async function getEditions(newsroomId: string): Promise<Edition[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("editions")
    .select("*")
    .eq("newsroom_id", newsroomId)
    .order("created_at", { ascending: false })
    .returns<Edition[]>();
  return data ?? [];
}

export async function getEdition(id: string): Promise<Edition | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("editions")
    .select("*")
    .eq("id", id)
    .single<Edition>();
  return data ?? null;
}

export interface MonthSpend {
  filed: number;
  inputTokens: number;
  outputTokens: number;
}

/** Token spend this calendar month, for the budget cockpit. */
export async function getMonthSpend(newsroomId: string): Promise<MonthSpend> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("desk_runs")
    .select("input_tokens, output_tokens, filed_count")
    .eq("newsroom_id", newsroomId)
    .gte("ran_at", since.toISOString());

  const rows =
    (data as
      | { input_tokens: number; output_tokens: number; filed_count: number }[]
      | null) ?? [];
  return rows.reduce<MonthSpend>(
    (acc, r) => ({
      filed: acc.filed + r.filed_count,
      inputTokens: acc.inputTokens + r.input_tokens,
      outputTokens: acc.outputTokens + r.output_tokens,
    }),
    { filed: 0, inputTokens: 0, outputTokens: 0 }
  );
}
