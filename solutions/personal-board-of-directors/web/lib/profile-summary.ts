import type { SeniorityLevel, TimeHorizon, WebUserProfile } from "./types";
import { judgementSummary } from "./judgement-summary";

/**
 * Profile Summary
 *
 * Turns the saved judgement profile into plain-text context for the board
 * flow, so clarifying questions and every advisor know who the user is and
 * what they are working toward — not only the advocate.
 */

const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  early: "early career",
  mid: "mid-level",
  senior: "senior",
  executive: "executive",
  founder: "founder / owner",
};

const TIME_HORIZON_LABELS: Record<TimeHorizon, string> = {
  immediate: "immediate (days to weeks)",
  short_term: "short term (1–3 months)",
  medium_term: "medium term (3–12 months)",
  long_term: "long term (1+ years)",
};

/** Upper bound on the decision plus profile and clarifying answers sent to the board routes. */
export const MAX_DECISION_CONTEXT_CHARS = 12_000;

export function buildProfileContext(profile: WebUserProfile): string {
  const lines = [
    profile.name && `Name: ${profile.name}`,
    `Seniority: ${SENIORITY_LABELS[profile.seniorityLevel]}`,
    profile.background && `Background: ${profile.background}`,
    profile.experienceDomains.length > 0 && `Experience domains: ${profile.experienceDomains.join(", ")}`,
    profile.context && `Current situation: ${profile.context}`,
    profile.primaryGoal && `Primary goal: ${profile.primaryGoal}`,
    profile.successDefinition && `Success looks like: ${profile.successDefinition}`,
    `Time horizon: ${TIME_HORIZON_LABELS[profile.timeHorizon]}`,
    profile.sacrificesAcceptable.length > 0 && `Willing to trade off: ${profile.sacrificesAcceptable.join(", ")}`,
    profile.nonNegotiables.length > 0 && `Non-negotiables: ${profile.nonNegotiables.join(", ")}`,
    profile.resourceLimits && `Resource limits: ${profile.resourceLimits}`,
    profile.knownWeaknesses.length > 0 && `Self-identified weaknesses: ${profile.knownWeaknesses.join(", ")}`,
    profile.blindSpots.length > 0 && `Possible blind spots: ${profile.blindSpots.join(", ")}`,
    `Judgement style (from a scenario assessment): ${judgementSummary(profile.rubric)}`,
  ].filter(Boolean);

  return lines.join("\n");
}

/** A starting decision statement drawn from the profile's goal and situation. */
export function profileDecisionStarter(profile: WebUserProfile): string {
  return [profile.primaryGoal, profile.context].filter((s) => s.trim()).join(" ");
}
