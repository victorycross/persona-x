import { z } from "zod";

/**
 * Profile Draft
 *
 * Unfinished profile answers are kept in the browser so leaving the page
 * mid-way (or refreshing) doesn't lose them. The draft is cleared when the
 * profile is completed or the user discards it.
 */

const DRAFT_KEY = "persona-x-profile-draft";

const ProfileDraftSchema = z.object({
  version: z.literal(1),
  savedAt: z.string(),
  step: z.enum(["about", "goals", "assessment"]),
  fields: z.object({
    name: z.string(),
    background: z.string(),
    seniorityLevel: z.enum(["early", "mid", "senior", "executive", "founder"]),
    domains: z.string(),
    context: z.string(),
    primaryGoal: z.string(),
    successDefinition: z.string(),
    timeHorizon: z.enum(["immediate", "short_term", "medium_term", "long_term"]),
    sacrifices: z.string(),
    nonNegotiables: z.string(),
    resourceLimits: z.string(),
    weaknesses: z.string(),
    blindSpots: z.string(),
  }),
  responses: z.record(z.number().int().min(0)),
});

export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;

export function loadProfileDraft(): ProfileDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = ProfileDraftSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveProfileDraft(draft: ProfileDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable or full — drafts are best-effort
  }
}

export function clearProfileDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // localStorage unavailable
  }
}
