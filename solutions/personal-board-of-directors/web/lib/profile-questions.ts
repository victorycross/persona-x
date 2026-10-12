import type { ProfileQuestion, ProfileQuestionResponse, RubricScoreDisplay } from "./types";

const RUBRIC_DIMENSIONS = [
  "risk_appetite",
  "evidence_threshold",
  "tolerance_for_ambiguity",
  "intervention_frequency",
  "escalation_bias",
  "delivery_vs_rigour_bias",
] as const;

type RubricDimensionName = (typeof RUBRIC_DIMENSIONS)[number];

export type RubricProfile = Record<RubricDimensionName, RubricScoreDisplay>;

const NOTE_TEMPLATES: Record<RubricDimensionName, { low: string; mid: string; high: string }> = {
  risk_appetite: {
    low: "Strongly prefers proven approaches with clear downside protection before committing",
    mid: "Balances caution with pragmatism, willing to accept moderate uncertainty when the rationale is sound",
    high: "Comfortable with significant uncertainty and willing to move decisively when potential upside justifies it",
  },
  evidence_threshold: {
    low: "Relies on directional signals, experience, and professional judgement rather than exhaustive data",
    mid: "Requires reasonable supporting evidence but does not demand certainty before proceeding",
    high: "Requires documented, verified evidence before accepting conclusions or committing to action",
  },
  tolerance_for_ambiguity: {
    low: "Strongly prefers clarity and defined parameters before engaging, uncomfortable operating in grey areas",
    mid: "Can operate with some ambiguity but actively works to resolve it as a priority",
    high: "Comfortable navigating incomplete or evolving information, adapts approach as clarity emerges",
  },
  intervention_frequency: {
    low: "Prefers to observe and let others drive, stepping in only when something material is at stake",
    mid: "Intervenes selectively at key decision points or when the discussion needs redirecting",
    high: "Actively engages throughout discussions, frequently challenging, clarifying, and redirecting",
  },
  escalation_bias: {
    low: "Prefers to resolve issues locally and handle concerns directly rather than escalating up",
    mid: "Escalates when the issue exceeds their authority or the stakes warrant wider visibility",
    high: "Quickly escalates issues, risks, and concerns to ensure appropriate oversight and governance",
  },
  delivery_vs_rigour_bias: {
    low: "Strongly favours thoroughness and precision, willing to delay delivery for quality assurance",
    mid: "Balances the need for quality with pragmatic delivery timelines based on context",
    high: "Prioritises momentum and delivery, accepting that refinement can follow initial progress",
  },
};

function generateInterpretiveNote(dimension: RubricDimensionName, score: number): string {
  const templates = NOTE_TEMPLATES[dimension];
  if (score <= 3) return templates.low;
  if (score <= 7) return templates.mid;
  return templates.high;
}

export function scoreResponses(responses: ProfileQuestionResponse[]): RubricProfile {
  const accumulators = new Map<RubricDimensionName, { total: number; count: number }>();

  for (const dim of RUBRIC_DIMENSIONS) {
    accumulators.set(dim, { total: 0, count: 0 });
  }

  for (const response of responses) {
    const question = PROFILE_QUESTION_BANK.find((q) => q.id === response.question_id);
    if (!question) continue;

    const optionIndex = response.selected_option;
    if (optionIndex < 0 || optionIndex >= question.options.length) continue;

    const option = question.options[optionIndex]!;

    for (const [dim, score] of Object.entries(option.scores)) {
      if (score === undefined) continue;
      const acc = accumulators.get(dim as RubricDimensionName);
      if (acc) {
        acc.total += score;
        acc.count += 1;
      }
    }
  }

  const profile = {} as Record<string, RubricScoreDisplay>;

  for (const dim of RUBRIC_DIMENSIONS) {
    const acc = accumulators.get(dim)!;
    const raw = acc.count > 0 ? acc.total / acc.count : 5;
    const score = Math.max(1, Math.min(10, Math.round(raw)));
    profile[dim] = {
      score,
      note: generateInterpretiveNote(dim, score),
    };
  }

  return profile as RubricProfile;
}

/**
 * Scenario bank. Each scenario scores two rubric dimensions.
 *
 * - core (6): required; every dimension is measured exactly twice.
 * - extended (3): optional extra precision; each dimension gets a third reading.
 */
export const PROFILE_QUESTION_BANK: ProfileQuestion[] = [
  {
    id: "risk_evidence_01",
    tier: "core",
    category: "Risk & Evidence",
    scenario:
      "A promising opportunity lands on your desk with strong potential upside but limited data to back it up. The window closes in 48 hours.",
    context:
      "You have enough capital to absorb a loss, but not enough data to model the downside precisely.",
    options: [
      { label: "Pass — insufficient data to make a sound decision", scores: { risk_appetite: 2, evidence_threshold: 9 } },
      { label: "Commission a rapid analysis and decide when results come in, even if the window narrows", scores: { risk_appetite: 4, evidence_threshold: 7 } },
      { label: "Take a partial position to limit downside while keeping the option open", scores: { risk_appetite: 7, evidence_threshold: 4 } },
      { label: "Move decisively — the opportunity cost of waiting outweighs the data gap", scores: { risk_appetite: 9, evidence_threshold: 2 } },
    ],
  },
  {
    id: "ambiguity_01",
    tier: "core",
    category: "Ambiguity & Clarity",
    scenario:
      "You are leading a project where the client keeps changing requirements. The team is frustrated and progress is stalling.",
    context:
      "The client is important to the business. Pushing back too hard risks the relationship.",
    options: [
      { label: "Halt work and demand a formal requirements freeze before continuing", scores: { tolerance_for_ambiguity: 2, intervention_frequency: 9 } },
      { label: "Escalate to the client's leadership requesting a single point of decision", scores: { tolerance_for_ambiguity: 4, intervention_frequency: 7 } },
      { label: "Absorb the changes into an agile backlog and reprioritise each sprint", scores: { tolerance_for_ambiguity: 7, intervention_frequency: 4 } },
      { label: "Adapt on the fly — shifting requirements are normal and the team should learn to roll with them", scores: { tolerance_for_ambiguity: 9, intervention_frequency: 2 } },
    ],
  },
  {
    id: "intervention_01",
    tier: "core",
    category: "Intervention & Delegation",
    scenario:
      "A direct report is managing a high-stakes client relationship. You hear through informal channels that the client is unhappy but your report says everything is fine.",
    context:
      "Intervening risks undermining your report's authority. Not intervening risks losing the client.",
    options: [
      { label: "Contact the client directly to assess the situation yourself", scores: { intervention_frequency: 9, escalation_bias: 7 } },
      { label: "Have a direct conversation with your report sharing what you have heard and ask for their honest assessment", scores: { intervention_frequency: 7, escalation_bias: 4 } },
      { label: "Ask a peer to check in with the client casually to get an independent read", scores: { intervention_frequency: 4, escalation_bias: 5 } },
      { label: "Trust your report — they are closest to the situation and you hired them for a reason", scores: { intervention_frequency: 2, escalation_bias: 2 } },
    ],
  },
  {
    id: "escalation_01",
    tier: "core",
    category: "Escalation & Boundaries",
    scenario:
      "A compliance issue surfaces in a project you oversee. It is likely technical rather than substantive, but you are not certain.",
    context:
      "Escalating triggers a formal review process that will delay the project by 3 weeks. Not escalating leaves you personally accountable if it turns out to be substantive.",
    options: [
      { label: "Escalate immediately — compliance ambiguity always gets escalated", scores: { escalation_bias: 9, risk_appetite: 2 } },
      { label: "Consult the compliance team informally before deciding whether to trigger the formal process", scores: { escalation_bias: 6, risk_appetite: 4 } },
      { label: "Document the issue, apply a fix, and flag it in the next regular review cycle", scores: { escalation_bias: 4, risk_appetite: 6 } },
      { label: "Fix it and move on — this is clearly technical and the formal process would be disproportionate", scores: { escalation_bias: 2, risk_appetite: 9 } },
    ],
  },
  {
    id: "speed_rigour_02",
    tier: "core",
    category: "Speed vs Thoroughness",
    scenario:
      "You need to submit a proposal to a potential partner. You have a solid draft but limited time to refine it.",
    context:
      "The partner has indicated other parties are interested. Submitting early shows eagerness; submitting late shows thoroughness.",
    options: [
      { label: "Take the full time available — a polished proposal demonstrates professionalism and rigour", scores: { delivery_vs_rigour_bias: 2, evidence_threshold: 8 } },
      { label: "Refine the key sections and submit a day early with a note that supplementary detail can follow", scores: { delivery_vs_rigour_bias: 5, evidence_threshold: 6 } },
      { label: "Submit the solid draft now — the substance is there and speed signals commitment", scores: { delivery_vs_rigour_bias: 8, evidence_threshold: 3 } },
      { label: "Send a brief expression of interest immediately, with the full proposal to follow within 24 hours", scores: { delivery_vs_rigour_bias: 7, evidence_threshold: 5 } },
    ],
  },
  {
    id: "ambiguity_speed_01",
    tier: "core",
    category: "Ambiguity & Speed",
    scenario:
      "Your organisation is restructuring and your role is uncertain. You have been asked to continue delivering while the new structure is finalised.",
    context:
      "Some colleagues are pausing work until clarity emerges. Others are positioning for new roles. Deliverables are still expected.",
    options: [
      { label: "Pause discretionary work and focus only on contractual obligations until the structure is clear", scores: { tolerance_for_ambiguity: 2, delivery_vs_rigour_bias: 3 } },
      { label: "Continue current work but avoid starting anything new that might not survive the restructure", scores: { tolerance_for_ambiguity: 4, delivery_vs_rigour_bias: 5 } },
      { label: "Keep delivering at full pace — demonstrating value during uncertainty is how you secure your position", scores: { tolerance_for_ambiguity: 7, delivery_vs_rigour_bias: 8 } },
      { label: "Use the ambiguity as an opportunity to shape the new structure by taking initiative on visible projects", scores: { tolerance_for_ambiguity: 9, delivery_vs_rigour_bias: 7 } },
    ],
  },
  {
    id: "risk_evidence_02",
    tier: "extended",
    category: "Risk & Evidence",
    scenario:
      "Your team proposes a significant strategic pivot. Their presentation is compelling but relies heavily on anecdotal evidence and market intuition.",
    context:
      "The current strategy is safe but showing diminishing returns. Competitor activity suggests the market is shifting.",
    options: [
      { label: "Reject the pivot until they bring quantitative market research and financial modelling", scores: { risk_appetite: 2, evidence_threshold: 9 } },
      { label: "Ask for a structured pilot with defined metrics before committing fully", scores: { risk_appetite: 5, evidence_threshold: 6 } },
      { label: "Approve a time-boxed experiment with limited resources to test the thesis", scores: { risk_appetite: 7, evidence_threshold: 4 } },
      { label: "Back the pivot — market intuition from experienced operators is evidence enough", scores: { risk_appetite: 9, evidence_threshold: 2 } },
    ],
  },
  {
    id: "ambiguity_02",
    tier: "extended",
    category: "Ambiguity & Clarity",
    scenario:
      "You are asked to make a hiring decision for a critical role. Two finalists are close, and your team is split.",
    context:
      "The role has been open for 3 months. Each additional week costs the team productivity.",
    options: [
      { label: "Run additional assessment rounds until a clear winner emerges", scores: { tolerance_for_ambiguity: 2, delivery_vs_rigour_bias: 2 } },
      { label: "Define the three most critical criteria and score both candidates objectively", scores: { tolerance_for_ambiguity: 4, delivery_vs_rigour_bias: 4 } },
      { label: "Pick the one whose strengths best match the immediate project needs", scores: { tolerance_for_ambiguity: 7, delivery_vs_rigour_bias: 7 } },
      { label: "Trust your gut — both are qualified, and speed of decision matters more than marginal differences", scores: { tolerance_for_ambiguity: 9, delivery_vs_rigour_bias: 9 } },
    ],
  },
  {
    id: "intervention_02",
    tier: "extended",
    category: "Intervention & Delegation",
    scenario:
      "During a board presentation, a colleague presents data you believe is materially misleading. Correcting them publicly would be awkward.",
    context:
      "The board is about to make a funding decision based on this data. Your colleague outranks you.",
    options: [
      { label: "Raise it immediately in the meeting — accuracy matters more than comfort", scores: { intervention_frequency: 9, escalation_bias: 8 } },
      { label: "Ask a clarifying question that surfaces the discrepancy without direct confrontation", scores: { intervention_frequency: 7, escalation_bias: 5 } },
      { label: "Note it and raise it privately with your colleague after the meeting", scores: { intervention_frequency: 4, escalation_bias: 3 } },
      { label: "Let it go — they may have context you do not, and the board will do its own due diligence", scores: { intervention_frequency: 2, escalation_bias: 2 } },
    ],
  },
];

export const CORE_QUESTIONS = PROFILE_QUESTION_BANK.filter((q) => q.tier === "core");
export const EXTENDED_QUESTIONS = PROFILE_QUESTION_BANK.filter((q) => q.tier === "extended");
