import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, WEB_SEARCH_TOOL, addUsage, textOf, type Usage } from "./anthropic";
import type { Beat, DraftFiling, Significance } from "./types";

export interface DeskResult {
  filings: DraftFiling[];
  usage: Usage;
}

const MAX_CONTINUATIONS = 6; // bound the server-side web-search loop

const SIG_VALUES: Significance[] = ["low", "medium", "high"];

/**
 * Run one desk: research its beat on the live web and file cited stories.
 *
 * The desk uses the web_search server tool (which carries its own citations and
 * dynamic filtering) to gather, then returns a strict JSON array of filings as
 * its final message. We avoid output_config.format here because structured
 * outputs are incompatible with citations — instead we instruct a JSON-only
 * final turn and parse it tolerantly, the same proven shape as the local
 * newsroom-watch tool.
 */
export async function runDesk(beat: Beat): Promise<DeskResult> {
  const client = anthropic();
  const today = new Date().toISOString().slice(0, 10);

  const system = [
    "You are a newsroom DESK — a specialist reporter assigned to a single beat.",
    "Research the beat on the live web using the web_search tool. Find only",
    "SIGNIFICANT, genuinely new developments — not routine noise.",
    "",
    "Anti-fabrication rules (non-negotiable):",
    "- Every story MUST come from a real search result with a real URL.",
    "- Never invent headlines, sources, dates, or facts. If unsure, omit it.",
    "- Mark official company/government releases with \"official\": true.",
    `- Today is ${today}. Only include items within the recency window.`,
    "- Rate significance honestly: high = materially changes the picture;",
    "  medium = noteworthy; low = minor. Be conservative.",
  ].join("\n");

  const assignment = [
    `BEAT: ${beat.name}`,
    `STANDING ASSIGNMENT: ${beat.brief}`,
    `RECENCY WINDOW: last ${beat.recency_days} day(s).`,
    `FILE AT MOST: ${beat.max_items} stories.`,
    "",
    "When you have finished searching, reply with ONLY a JSON array (no prose,",
    "no markdown fences) of filings. Each filing object has exactly these keys:",
    `{`,
    `  "headline": string,`,
    `  "summary": string,        // 1-3 sentences, factual`,
    `  "source": string|null,    // publication / outlet name`,
    `  "url": string|null,       // the source URL`,
    `  "official": boolean,`,
    `  "significance": "low"|"medium"|"high",`,
    `  "published_at": string|null  // ISO date YYYY-MM-DD, or null if undated`,
    `}`,
    "If there is no significant news in the window, reply with [].",
  ].join("\n");

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: assignment },
  ];

  let usage: Usage = { input_tokens: 0, output_tokens: 0 };
  let final: Anthropic.Message | null = null;

  for (let i = 0; i < MAX_CONTINUATIONS; i++) {
    const response = await client.messages.create({
      model: beat.model,
      max_tokens: 4000,
      system,
      tools: [WEB_SEARCH_TOOL],
      messages,
    });
    usage = addUsage(usage, response.usage);

    if (response.stop_reason === "pause_turn") {
      // Server-tool loop hit its iteration cap — append and resume.
      messages.push({ role: "assistant", content: response.content });
      continue;
    }
    final = response;
    break;
  }

  const filings = final ? parseFilings(textOf(final)) : [];
  return { filings: filings.slice(0, beat.max_items), usage };
}

/** Tolerantly extract a JSON array of filings from the desk's final message. */
export function parseFilings(text: string): DraftFiling[] {
  const raw = extractJsonArray(text);
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const out: DraftFiling[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const headline = typeof o.headline === "string" ? o.headline.trim() : "";
    const summary = typeof o.summary === "string" ? o.summary.trim() : "";
    if (!headline || !summary) continue;

    const sig = SIG_VALUES.includes(o.significance as Significance)
      ? (o.significance as Significance)
      : "medium";

    out.push({
      headline,
      summary,
      source: typeof o.source === "string" ? o.source : null,
      url: typeof o.url === "string" ? o.url : null,
      official: o.official === true,
      significance: sig,
      published_at: normalizeDate(o.published_at),
    });
  }
  return out;
}

function extractJsonArray(text: string): string | null {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1] : text;
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  return body.slice(start, end + 1);
}

function normalizeDate(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const m = v.match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}
