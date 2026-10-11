/**
 * Short summary of an advisor's response for the advisors overview.
 *
 * Advisors are prompted to open with "Bottom line: …". When that line is
 * present it is the summary and is removed from the body; otherwise the
 * summary falls back to the first two sentences of the first paragraph.
 */

const BOTTOM_LINE = /^\s*[*_#\s]*bottom line[*_]*\s*[:—-]\s*[*_]*\s*(.+?)[*_]*\s*$/im;
const MAX_FALLBACK_CHARS = 280;

export interface ResponseSummary {
  summary: string;
  /** Response body without the bottom-line line, when one was found. */
  body: string;
}

export function summariseResponse(content: string): ResponseSummary {
  const match = content.match(BOTTOM_LINE);
  if (match?.[1]) {
    const body = content.replace(match[0], "").replace(/^\s+/, "");
    return { summary: match[1].trim(), body };
  }

  const firstParagraph = content.trim().split(/\n\s*\n/)[0] ?? "";
  const plain = firstParagraph.replace(/^[#*\d.\s]+/, "").replace(/[*_]/g, "").trim();
  const sentences = plain.match(/[^.!?]+[.!?]+/g);
  let summary = sentences ? sentences.slice(0, 2).join("").trim() : plain;
  if (summary.length > MAX_FALLBACK_CHARS) {
    summary = `${summary.slice(0, MAX_FALLBACK_CHARS).replace(/\s+\S*$/, "")}…`;
  }
  return { summary, body: content };
}
