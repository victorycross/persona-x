import { z } from "zod";

/**
 * Profile Import
 *
 * Shared schemas, limits, and user guidance for pre-filling the judgement
 * profile from a LinkedIn export, a résumé, or a short goals statement.
 *
 * Imported values are suggestions only: they pre-fill the About You and
 * Goals & Constraints steps for the user to review. The judgement rubric is
 * never inferred from a profile — the scenario assessment remains mandatory.
 */

export type ImportSource = "linkedin" | "resume";

export const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_TEXT_CHARS = 20_000;
export const MAX_GOALS_STATEMENT_CHARS = 2_000;

const SENIORITY_VALUES = ["early", "mid", "senior", "executive", "founder"] as const;
const TIME_HORIZON_VALUES = ["immediate", "short_term", "medium_term", "long_term"] as const;

const trimmed = (max: number) => z.string().trim().max(max);
const shortList = z.array(trimmed(120)).max(8);

export const ProfileImportResultSchema = z.object({
  name: trimmed(120),
  background: trimmed(1200),
  experienceDomains: shortList,
  seniorityLevel: z.enum(SENIORITY_VALUES).nullable(),
  context: trimmed(600),
});

export type ProfileImportResult = z.infer<typeof ProfileImportResultSchema>;

export const GoalsDraftResultSchema = z.object({
  primaryGoal: trimmed(600),
  successDefinition: trimmed(400),
  timeHorizon: z.enum(TIME_HORIZON_VALUES).nullable(),
  sacrificesAcceptable: shortList,
  nonNegotiables: shortList,
  resourceLimits: trimmed(400),
});

export type GoalsDraftResult = z.infer<typeof GoalsDraftResultSchema>;

/** Context from the About You step, sent with a goals draft request. */
export const GoalsDraftRequestSchema = z.object({
  statement: z.string().trim().min(10).max(MAX_GOALS_STATEMENT_CHARS),
  about: z
    .object({
      background: trimmed(1200).optional(),
      seniorityLevel: z.enum(SENIORITY_VALUES).optional(),
      experienceDomains: z.array(trimmed(120)).max(20).optional(),
      context: trimmed(600).optional(),
    })
    .optional(),
});

export type GoalsDraftRequest = z.infer<typeof GoalsDraftRequestSchema>;

export interface ImportGuide {
  title: string;
  summary: string;
  pdfSteps: string[];
  pasteSteps: string[];
  tips: string[];
}

export const IMPORT_GUIDES: Record<ImportSource, ImportGuide> = {
  linkedin: {
    title: "LinkedIn profile",
    summary:
      "LinkedIn can export your profile as a PDF. This is the most complete and reliable option.",
    pdfSteps: [
      "On a computer (the mobile app cannot export), sign in at linkedin.com.",
      "Click “Me” in the top bar, then “View profile”.",
      "Under your headline, click “Resources” (shown as “More” on some accounts).",
      "Choose “Save to PDF”. The file downloads as Profile.pdf.",
      "Upload that file below.",
    ],
    pasteSteps: [
      "Open your LinkedIn profile in a browser.",
      "Select from your name down to the end of the Experience section and copy it.",
      "Paste the text below. Include your About section if you have one — it helps the most.",
    ],
    tips: [
      "Make sure your current role and About section are up to date before exporting.",
      "We do not accept LinkedIn URLs — LinkedIn blocks automated access to profiles.",
    ],
  },
  resume: {
    title: "Résumé / CV",
    summary:
      "Upload your most recent résumé or CV as a PDF, or paste its text.",
    pdfSteps: [
      "Open your most recent résumé or CV.",
      "Save it as a PDF — Word: File → Save As → PDF. Google Docs: File → Download → PDF. Pages: File → Export To → PDF.",
      "Upload the PDF below (2 MB maximum).",
    ],
    pasteSteps: [
      "Open your résumé or CV.",
      "Select all of the text (Ctrl+A or ⌘A) and copy it.",
      "Paste the text below.",
    ],
    tips: [
      "A résumé with a short professional summary at the top gives the best result.",
      "You may remove your phone number and home address first — they are not needed.",
    ],
  },
};
