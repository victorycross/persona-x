import type { WebUserProfile } from "./types";

/**
 * Judgement Summary
 *
 * Turns the six rubric scores into an overall risk profile score and a short
 * plain-English paragraph. Deterministic rules, not an LLM, so the summary
 * always matches the chart and works for any saved profile.
 */

type Rubric = WebUserProfile["rubric"];
type Dimension = keyof Rubric;

export interface RiskProfile {
  /** 1.0 (very cautious) to 10.0 (bold), one decimal place */
  score: number;
  label: string;
}

const RISK_BANDS: { max: number; label: string; description: string }[] = [
  { max: 2.5, label: "Very cautious", description: "you put protecting the downside first and want certainty before you commit" },
  { max: 4.5, label: "Cautious", description: "you lean towards proven paths and want reasonable confidence before acting" },
  { max: 6.5, label: "Balanced", description: "you weigh upside against downside case by case rather than defaulting either way" },
  { max: 8.5, label: "Growth-oriented", description: "you will accept meaningful uncertainty when the potential upside justifies it" },
  { max: 10, label: "Bold", description: "you move decisively on opportunities and accept significant uncertainty to do so" },
];

/**
 * Overall risk posture. Risk appetite counts double; evidence threshold and
 * escalation bias are reversed (higher means more cautious). Intervention
 * frequency describes involvement rather than risk, so it is excluded.
 */
export function riskProfile(rubric: Rubric): RiskProfile {
  const raw =
    (2 * rubric.risk_appetite.score +
      (11 - rubric.evidence_threshold.score) +
      rubric.tolerance_for_ambiguity.score +
      (11 - rubric.escalation_bias.score) +
      rubric.delivery_vs_rigour_bias.score) /
    6;
  const score = Math.round(Math.min(10, Math.max(1, raw)) * 10) / 10;
  const band = RISK_BANDS.find((b) => score <= b.max) ?? RISK_BANDS[RISK_BANDS.length - 1]!;
  return { score, label: band.label };
}

/** What a low (≤4) or high (≥7) score on each dimension says, as a clause after "you". */
const TRAIT_PHRASES: Record<Dimension, { low: string; high: string }> = {
  risk_appetite: {
    low: "prefer proven options with the downside protected",
    high: "are willing to back bold opportunities when the upside is there",
  },
  evidence_threshold: {
    low: "are comfortable acting on experience and directional signals",
    high: "want verified evidence before you commit",
  },
  tolerance_for_ambiguity: {
    low: "like clear parameters before you engage",
    high: "are comfortable working through incomplete or shifting information",
  },
  intervention_frequency: {
    low: "tend to let others lead and step in only when it matters",
    high: "step in early and often to challenge and redirect",
  },
  escalation_bias: {
    low: "prefer to resolve issues yourself rather than escalate",
    high: "raise concerns quickly so the right people have visibility",
  },
  delivery_vs_rigour_bias: {
    low: "will trade speed for thoroughness",
    high: "favour momentum and refine as you go",
  },
};

/** Tensions worth naming, checked in order; the first match is used. */
const TENSIONS: { when: (r: Rubric) => boolean; text: string }[] = [
  {
    when: (r) => r.risk_appetite.score >= 7 && r.evidence_threshold.score <= 4,
    text: "The trade-off is that you may commit before key assumptions are tested — expect your advisors to press on the evidence.",
  },
  {
    when: (r) => r.risk_appetite.score <= 4 && r.evidence_threshold.score >= 7,
    text: "The trade-off is that good opportunities can pass while you wait for certainty — your advisors will test whether caution is costing you.",
  },
  {
    when: (r) => r.tolerance_for_ambiguity.score >= 7 && r.delivery_vs_rigour_bias.score >= 7,
    text: "You keep things moving amid uncertainty; make sure decisions that are hard to reverse still get a second look.",
  },
  {
    when: (r) => r.tolerance_for_ambiguity.score <= 4 && r.delivery_vs_rigour_bias.score <= 4,
    text: "Unclear or shifting situations may slow you down; agreeing early on what “good enough” looks like can help.",
  },
  {
    when: (r) => r.intervention_frequency.score >= 7 && r.escalation_bias.score >= 7,
    text: "Stepping in and escalating early brings visibility, but can crowd out others’ ownership.",
  },
  {
    when: (r) => r.intervention_frequency.score <= 4 && r.escalation_bias.score <= 4,
    text: "Letting others own problems builds trust; just check you hear about issues early enough to act.",
  },
];

function joinClauses(clauses: string[]): string {
  if (clauses.length <= 1) return clauses.join("");
  return `${clauses.slice(0, -1).join(", ")} and ${clauses[clauses.length - 1]}`;
}

/** A short paragraph describing what the assessment answers say. */
export function judgementSummary(rubric: Rubric): string {
  const { score, label } = riskProfile(rubric);
  const band = RISK_BANDS.find((b) => b.label === label)!;

  const sentences = [
    `Overall your risk profile is ${label.toLowerCase()} (${score.toFixed(1)}/10): ${band.description}.`,
  ];

  // The up-to-three most pronounced traits, furthest from the midpoint
  const traits = (Object.keys(TRAIT_PHRASES) as Dimension[])
    .map((dim) => ({ dim, score: rubric[dim].score }))
    .filter((t) => t.score <= 4 || t.score >= 7)
    .sort((a, b) => Math.abs(b.score - 5.5) - Math.abs(a.score - 5.5))
    .slice(0, 3)
    .map((t) => TRAIT_PHRASES[t.dim][t.score >= 7 ? "high" : "low"]);

  sentences.push(
    traits.length > 0
      ? `Your answers suggest you ${joinClauses(traits)}.`
      : "Your answers sit near the middle on every dimension, so you adapt your approach to the situation rather than following a fixed style."
  );

  const tension = TENSIONS.find((t) => t.when(rubric));
  if (tension) sentences.push(tension.text);

  return sentences.join(" ");
}
