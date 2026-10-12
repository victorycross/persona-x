"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileContext } from "@/lib/profile-context";
import { PROFILE_QUESTION_BANK, scoreResponses } from "@/lib/profile-questions";
import { RubricChart } from "@/components/rubric-chart";
import { ProfileImport } from "@/components/profile/profile-import";
import { GoalsDraft } from "@/components/profile/goals-draft";
import type { GoalsDraftResult, ProfileImportResult } from "@/lib/profile-import";
import {
  clearProfileDraft,
  loadProfileDraft,
  saveProfileDraft,
  type ProfileDraft,
} from "@/lib/profile-draft";
import type {
  ProfileStep,
  SeniorityLevel,
  TimeHorizon,
  ProfileQuestionResponse,
  WebUserProfile,
} from "@/lib/types";

const SENIORITY_OPTIONS: { value: SeniorityLevel; label: string }[] = [
  { value: "early", label: "Early Career" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "executive", label: "Executive" },
  { value: "founder", label: "Founder / Owner" },
];

const TIME_HORIZON_OPTIONS: { value: TimeHorizon; label: string }[] = [
  { value: "immediate", label: "Immediate (days/weeks)" },
  { value: "short_term", label: "Short Term (1–3 months)" },
  { value: "medium_term", label: "Medium Term (3–12 months)" },
  { value: "long_term", label: "Long Term (1+ years)" },
];

const STEP_LABELS: Record<ProfileStep, string> = {
  about: "About You",
  goals: "Goals & Constraints",
  assessment: "Judgement Assessment",
  complete: "Your Profile",
};

const STEPS: ProfileStep[] = ["about", "goals", "assessment", "complete"];

/** Fields that can be pre-filled from an import or goals draft. */
type FieldKey =
  | "name"
  | "background"
  | "seniorityLevel"
  | "domains"
  | "context"
  | "primaryGoal"
  | "successDefinition"
  | "timeHorizon"
  | "sacrifices"
  | "nonNegotiables"
  | "resourceLimits";

const CHOICE_FIELDS: ReadonlySet<FieldKey> = new Set(["seniorityLevel", "timeHorizon"]);

const FIELD_LABELS: Record<FieldKey, string> = {
  name: "Your Name",
  background: "Professional Background",
  seniorityLevel: "Seniority Level",
  domains: "Experience Domains",
  context: "Current Context",
  primaryGoal: "Primary Goal",
  successDefinition: "Success Definition",
  timeHorizon: "Time Horizon",
  sacrifices: "Acceptable Sacrifices",
  nonNegotiables: "Non-Negotiables",
  resourceLimits: "Resource Limits",
};

const ABOUT_FIELDS: ReadonlySet<FieldKey> = new Set(["name", "background", "seniorityLevel", "domains", "context"]);
const GOALS_FIELDS: ReadonlySet<FieldKey> = new Set(
  (Object.keys(FIELD_LABELS) as FieldKey[]).filter((k) => !ABOUT_FIELDS.has(k))
);

interface Suggestion {
  key: FieldKey;
  value: string;
}

function importToSuggestions(r: ProfileImportResult): Suggestion[] {
  return [
    { key: "name", value: r.name },
    { key: "background", value: r.background },
    { key: "domains", value: r.experienceDomains.join(", ") },
    { key: "seniorityLevel", value: r.seniorityLevel ?? "" },
    { key: "context", value: r.context },
  ];
}

function goalsToSuggestions(r: GoalsDraftResult): Suggestion[] {
  return [
    { key: "primaryGoal", value: r.primaryGoal },
    { key: "successDefinition", value: r.successDefinition },
    { key: "timeHorizon", value: r.timeHorizon ?? "" },
    { key: "sacrifices", value: r.sacrificesAcceptable.join(", ") },
    { key: "nonNegotiables", value: r.nonNegotiables.join(", ") },
    { key: "resourceLimits", value: r.resourceLimits },
  ];
}

type DraftFields = ProfileDraft["fields"];

/** Form field values for a saved profile, or the blank defaults. */
function profileFields(p: WebUserProfile | null): DraftFields {
  return {
    name: p?.name ?? "",
    background: p?.background ?? "",
    seniorityLevel: p?.seniorityLevel ?? "mid",
    domains: p?.experienceDomains.join(", ") ?? "",
    context: p?.context ?? "",
    primaryGoal: p?.primaryGoal ?? "",
    successDefinition: p?.successDefinition ?? "",
    timeHorizon: p?.timeHorizon ?? "medium_term",
    sacrifices: p?.sacrificesAcceptable.join(", ") ?? "",
    nonNegotiables: p?.nonNegotiables.join(", ") ?? "",
    resourceLimits: p?.resourceLimits ?? "",
    weaknesses: p?.knownWeaknesses.join(", ") ?? "",
    blindSpots: p?.blindSpots.join(", ") ?? "",
  };
}

/** Use an unfinished draft when there is no profile, or it is newer than the saved one. */
function initialFormState(existing: WebUserProfile | null) {
  const draft = loadProfileDraft();
  if (draft && (!existing || draft.savedAt > existing.completedAt)) {
    return { draft, step: draft.step as ProfileStep, fields: draft.fields, responses: draft.responses };
  }
  return {
    draft: null,
    step: (existing ? "complete" : "about") as ProfileStep,
    fields: profileFields(existing),
    responses: {} as Record<string, number>,
  };
}

export function ProfileForm() {
  const router = useRouter();
  const { profile: existingProfile, saveProfile } = useProfileContext();
  // Read once on mount: an unfinished draft takes precedence over the saved profile
  const [initial] = useState(() => initialFormState(existingProfile));
  const [restoredDraftAt, setRestoredDraftAt] = useState<string | null>(initial.draft?.savedAt ?? null);
  const [step, setStep] = useState<ProfileStep>(initial.step);

  // About fields
  const [name, setName] = useState(initial.fields.name);
  const [background, setBackground] = useState(initial.fields.background);
  const [seniorityLevel, setSeniorityLevel] = useState<SeniorityLevel>(initial.fields.seniorityLevel);
  const [domains, setDomains] = useState(initial.fields.domains);
  const [context, setContext] = useState(initial.fields.context);

  // Goals fields
  const [primaryGoal, setPrimaryGoal] = useState(initial.fields.primaryGoal);
  const [successDefinition, setSuccessDefinition] = useState(initial.fields.successDefinition);
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(initial.fields.timeHorizon);
  const [sacrifices, setSacrifices] = useState(initial.fields.sacrifices);
  const [nonNegotiables, setNonNegotiables] = useState(initial.fields.nonNegotiables);
  const [resourceLimits, setResourceLimits] = useState(initial.fields.resourceLimits);
  const [weaknesses, setWeaknesses] = useState(initial.fields.weaknesses);
  const [blindSpots, setBlindSpots] = useState(initial.fields.blindSpots);

  // Assessment
  const [responses, setResponses] = useState<Record<string, number>>(initial.responses);

  // Import / draft suggestions. "suggested" fields carry a review badge until
  // edited; "touched" fields were set by the user and are never overwritten
  // without confirmation.
  const [suggested, setSuggested] = useState<Set<FieldKey>>(new Set());
  const [touched, setTouched] = useState<Set<FieldKey>>(
    () => new Set<FieldKey>(existingProfile || initial.draft ? ["seniorityLevel", "timeHorizon"] : [])
  );
  const [conflicts, setConflicts] = useState<Suggestion[]>([]);

  const fieldValues: Record<FieldKey, string> = {
    name, background, seniorityLevel, domains, context,
    primaryGoal, successDefinition, timeHorizon, sacrifices, nonNegotiables, resourceLimits,
  };

  const fieldSetters: Record<FieldKey, (v: string) => void> = {
    name: setName,
    background: setBackground,
    seniorityLevel: (v) => setSeniorityLevel(v as SeniorityLevel),
    domains: setDomains,
    context: setContext,
    primaryGoal: setPrimaryGoal,
    successDefinition: setSuccessDefinition,
    timeHorizon: (v) => setTimeHorizon(v as TimeHorizon),
    sacrifices: setSacrifices,
    nonNegotiables: setNonNegotiables,
    resourceLimits: setResourceLimits,
  };

  /** Wrap a setter so a manual edit clears the "suggested" badge. */
  const edit = (key: FieldKey) => (value: string) => {
    fieldSetters[key](value);
    setTouched((prev) => new Set(prev).add(key));
    setSuggested((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const applySuggestions = (items: Suggestion[], force = false) => {
    const applied: FieldKey[] = [];
    const held: Suggestion[] = [];

    for (const s of items) {
      if (!s.value.trim()) continue;
      const current = fieldValues[s.key];
      if (current.trim() === s.value.trim()) continue;
      const userOwned = CHOICE_FIELDS.has(s.key)
        ? touched.has(s.key)
        : touched.has(s.key) || (current.trim() !== "" && !suggested.has(s.key));
      if (userOwned && !force) {
        held.push(s);
        continue;
      }
      fieldSetters[s.key](s.value);
      applied.push(s.key);
    }

    setSuggested((prev) => new Set([...prev, ...applied]));
    if (force) {
      setTouched((prev) => {
        const next = new Set(prev);
        applied.forEach((k) => next.delete(k));
        return next;
      });
    }
    setConflicts((prev) => [
      ...prev.filter((c) => !items.some((s) => s.key === c.key)),
      ...held,
    ]);
  };

  const replaceConflicts = (keys: ReadonlySet<FieldKey>) => {
    const toApply = conflicts.filter((c) => keys.has(c.key));
    applySuggestions(toApply, true);
    setConflicts((prev) => prev.filter((c) => !keys.has(c.key)));
  };

  const dismissConflicts = (keys: ReadonlySet<FieldKey>) => {
    setConflicts((prev) => prev.filter((c) => !keys.has(c.key)));
  };

  const handleResponse = useCallback((questionId: string, optionIndex: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const allQuestionsAnswered = PROFILE_QUESTION_BANK.every((q) => responses[q.id] !== undefined);

  const splitCommas = (s: string): string[] =>
    s.split(",").map((x) => x.trim()).filter(Boolean);

  const aboutValid = name.trim() && background.trim() && domains.trim() && context.trim();
  const goalsValid = primaryGoal.trim() && successDefinition.trim() && sacrifices.trim() && nonNegotiables.trim() && resourceLimits.trim();

  const buildProfile = useCallback((): WebUserProfile => {
    const questionResponses: ProfileQuestionResponse[] = Object.entries(responses).map(
      ([question_id, selected_option]) => ({ question_id, selected_option })
    );
    const rubric = scoreResponses(questionResponses);

    return {
      name: name.trim(),
      background: background.trim(),
      seniorityLevel,
      experienceDomains: splitCommas(domains),
      context: context.trim(),
      primaryGoal: primaryGoal.trim(),
      successDefinition: successDefinition.trim(),
      timeHorizon,
      sacrificesAcceptable: splitCommas(sacrifices),
      nonNegotiables: splitCommas(nonNegotiables),
      dependencies: [],
      resourceLimits: resourceLimits.trim(),
      knownWeaknesses: splitCommas(weaknesses),
      blindSpots: splitCommas(blindSpots),
      patterns: [],
      rubric,
      completedAt: new Date().toISOString(),
    };
  }, [name, background, seniorityLevel, domains, context, primaryGoal, successDefinition, timeHorizon, sacrifices, nonNegotiables, resourceLimits, weaknesses, blindSpots, responses]);

  // Keep unfinished answers in the browser until the profile is completed
  useEffect(() => {
    if (step === "complete") return;
    const fields: DraftFields = {
      name, background, seniorityLevel, domains, context,
      primaryGoal, successDefinition, timeHorizon, sacrifices, nonNegotiables, resourceLimits,
      weaknesses, blindSpots,
    };
    const baseline = profileFields(existingProfile);
    const dirty =
      (Object.keys(fields) as (keyof DraftFields)[]).some((k) => fields[k] !== baseline[k]) ||
      Object.keys(responses).length > 0;
    if (dirty) {
      saveProfileDraft({ version: 1, savedAt: new Date().toISOString(), step, fields, responses });
    } else {
      clearProfileDraft();
    }
  }, [
    step, name, background, seniorityLevel, domains, context, primaryGoal, successDefinition,
    timeHorizon, sacrifices, nonNegotiables, resourceLimits, weaknesses, blindSpots, responses, existingProfile,
  ]);

  const discardDraft = useCallback(() => {
    clearProfileDraft();
    const fields = profileFields(existingProfile);
    setName(fields.name);
    setBackground(fields.background);
    setSeniorityLevel(fields.seniorityLevel);
    setDomains(fields.domains);
    setContext(fields.context);
    setPrimaryGoal(fields.primaryGoal);
    setSuccessDefinition(fields.successDefinition);
    setTimeHorizon(fields.timeHorizon);
    setSacrifices(fields.sacrifices);
    setNonNegotiables(fields.nonNegotiables);
    setResourceLimits(fields.resourceLimits);
    setWeaknesses(fields.weaknesses);
    setBlindSpots(fields.blindSpots);
    setResponses({});
    setSuggested(new Set());
    setConflicts([]);
    setRestoredDraftAt(null);
    setStep(existingProfile ? "complete" : "about");
  }, [existingProfile]);

  const handleComplete = useCallback(() => {
    const profile = buildProfile();
    clearProfileDraft();
    saveProfile(profile);
    setRestoredDraftAt(null);
    setStep("complete");
  }, [buildProfile, saveProfile]);

  const handleRetake = useCallback(() => {
    setResponses({});
    setStep("about");
  }, []);

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="animate-fade-in">
      {/* Step progress */}
      <nav aria-label="Profile progress" className="mb-8">
        <div role="list" className="flex items-center justify-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              role="listitem"
              aria-current={i === stepIndex ? "step" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < stepIndex
                  ? "w-1.5 bg-board-accent"
                  : i === stepIndex
                    ? "w-6 bg-board-accent"
                    : "w-1.5 bg-board-text-tertiary/40"
              }`}
            >
              <span className="sr-only">
                {STEP_LABELS[s]}{i < stepIndex ? " (completed)" : i === stepIndex ? " (current)" : ""}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-board-text-tertiary">
          {STEP_LABELS[step]}
        </p>
      </nav>

      {restoredDraftAt && step !== "complete" && (
        <div
          role="status"
          className="mb-6 flex items-center justify-between gap-3 rounded-[12px] border border-board-border bg-board-surface-raised px-5 py-3 text-sm"
        >
          <span className="text-board-text-secondary">
            Welcome back — we kept your unfinished answers from{" "}
            {new Date(restoredDraftAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}.
          </span>
          <button
            type="button"
            onClick={discardDraft}
            className="flex-shrink-0 text-xs font-medium text-board-text-tertiary hover:text-board-text-secondary"
          >
            {existingProfile ? "Discard changes" : "Start over"}
          </button>
        </div>
      )}

      {step === "about" && (
        <div className="space-y-6">
          <ProfileImport onImported={(r) => applySuggestions(importToSuggestions(r))} />
          <ConflictNotice
            conflicts={conflicts.filter((c) => ABOUT_FIELDS.has(c.key))}
            onReplace={() => replaceConflicts(ABOUT_FIELDS)}
            onKeep={() => dismissConflicts(ABOUT_FIELDS)}
          />

          <div className="rounded-[16px] border border-board-border bg-board-surface px-6 py-7">
            <h2 className="text-2xl font-serif text-board-text mb-1">About You</h2>
            <p className="text-sm text-board-text-secondary mb-5">
              Tell us about your professional background so your advocate can argue from your position of strength.
            </p>

            <div className="space-y-4">
              <FieldGroup label="Your Name" suggested={suggested.has("name")}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => edit("name")(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="field-input"
                />
              </FieldGroup>

              <FieldGroup label="Professional Background" suggested={suggested.has("background")} hint="A brief summary of your career and expertise">
                <textarea
                  value={background}
                  onChange={(e) => edit("background")(e.target.value)}
                  placeholder="e.g. 15 years in product management, now VP Product at a startup"
                  rows={3}
                  className="field-input resize-none"
                />
              </FieldGroup>

              <FieldGroup label="Seniority Level" suggested={suggested.has("seniorityLevel")}>
                <div className="flex flex-wrap gap-2">
                  {SENIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => edit("seniorityLevel")(opt.value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        seniorityLevel === opt.value
                          ? "border-board-accent bg-board-accent/10 text-board-accent"
                          : "border-board-border text-board-text-secondary hover:border-board-accent/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label="Experience Domains" suggested={suggested.has("domains")} hint="Separate with commas">
                <input
                  type="text"
                  value={domains}
                  onChange={(e) => edit("domains")(e.target.value)}
                  placeholder="e.g. Product Management, Fintech"
                  className="field-input"
                />
              </FieldGroup>

              <FieldGroup label="Current Context" suggested={suggested.has("context")} hint="What situation or role context are you in right now?">
                <textarea
                  value={context}
                  onChange={(e) => edit("context")(e.target.value)}
                  placeholder="e.g. Leading product through a shift to self-serve sales"
                  rows={2}
                  className="field-input resize-none"
                />
              </FieldGroup>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep("goals")}
            disabled={!aboutValid}
            className="w-full rounded-[12px] bg-board-accent px-6 py-3.5 text-sm font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90 disabled:opacity-50 disabled:bg-board-surface-raised disabled:text-board-text-secondary disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {step === "goals" && (
        <div className="space-y-6">
          <GoalsDraft
            about={{
              background: background.trim() || undefined,
              seniorityLevel,
              experienceDomains: splitCommas(domains),
              context: context.trim() || undefined,
            }}
            onDrafted={(r) => applySuggestions(goalsToSuggestions(r))}
          />
          <ConflictNotice
            conflicts={conflicts.filter((c) => !ABOUT_FIELDS.has(c.key))}
            onReplace={() => replaceConflicts(GOALS_FIELDS)}
            onKeep={() => dismissConflicts(GOALS_FIELDS)}
          />

          <div className="rounded-[16px] border border-board-border bg-board-surface px-6 py-7">
            <h2 className="text-2xl font-serif text-board-text mb-1">Goals & Constraints</h2>
            <p className="text-sm text-board-text-secondary mb-5">
              Define what you are working toward and the boundaries your advocate must respect.
            </p>

            <div className="space-y-4">
              <FieldGroup label="Primary Goal" suggested={suggested.has("primaryGoal")} hint="What are you trying to achieve?">
                <textarea
                  value={primaryGoal}
                  onChange={(e) => edit("primaryGoal")(e.target.value)}
                  placeholder="e.g. Move to product-led growth without losing revenue"
                  rows={2}
                  className="field-input resize-none"
                />
              </FieldGroup>

              <FieldGroup label="Success Definition" suggested={suggested.has("successDefinition")} hint="What does a good outcome look like?">
                <input
                  type="text"
                  value={successDefinition}
                  onChange={(e) => edit("successDefinition")(e.target.value)}
                  placeholder="e.g. 30% of new revenue from self-serve"
                  className="field-input"
                />
              </FieldGroup>

              <FieldGroup label="Time Horizon" suggested={suggested.has("timeHorizon")}>
                <div className="flex flex-wrap gap-2">
                  {TIME_HORIZON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => edit("timeHorizon")(opt.value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        timeHorizon === opt.value
                          ? "border-board-accent bg-board-accent/10 text-board-accent"
                          : "border-board-border text-board-text-secondary hover:border-board-accent/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label="Acceptable Sacrifices" suggested={suggested.has("sacrifices")} hint="What are you willing to trade off? Separate with commas">
                <input
                  type="text"
                  value={sacrifices}
                  onChange={(e) => edit("sacrifices")(e.target.value)}
                  placeholder="e.g. Short-term revenue dip, slower releases"
                  className="field-input"
                />
              </FieldGroup>

              <FieldGroup label="Non-Negotiables" suggested={suggested.has("nonNegotiables")} hint="Hard constraints that cannot be compromised. Separate with commas">
                <input
                  type="text"
                  value={nonNegotiables}
                  onChange={(e) => edit("nonNegotiables")(e.target.value)}
                  placeholder="e.g. Keep the team intact, stay profitable"
                  className="field-input"
                />
              </FieldGroup>

              <FieldGroup label="Resource Limits" suggested={suggested.has("resourceLimits")} hint="Budget, time, or capacity constraints">
                <input
                  type="text"
                  value={resourceLimits}
                  onChange={(e) => edit("resourceLimits")(e.target.value)}
                  placeholder="e.g. $500K budget, 12-month runway"
                  className="field-input"
                />
              </FieldGroup>

              <FieldGroup label="Known Weaknesses" hint="Optional — self-identified areas of weakness. Separate with commas">
                <input
                  type="text"
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="e.g. Tendency to over-commit"
                  className="field-input"
                />
              </FieldGroup>

              <FieldGroup label="Blind Spots" hint="Optional — areas you may not see clearly. Separate with commas">
                <input
                  type="text"
                  value={blindSpots}
                  onChange={(e) => setBlindSpots(e.target.value)}
                  placeholder="e.g. Team capacity limits"
                  className="field-input"
                />
              </FieldGroup>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("about")}
              className="rounded-[12px] border border-board-border px-6 py-3.5 text-sm font-medium text-board-text-secondary transition-colors hover:bg-board-surface"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("assessment")}
              disabled={!goalsValid}
              className="flex-1 rounded-[12px] bg-board-accent px-6 py-3.5 text-sm font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90 disabled:opacity-50 disabled:bg-board-surface-raised disabled:text-board-text-secondary disabled:cursor-not-allowed"
            >
              Continue to Assessment
            </button>
          </div>
        </div>
      )}

      {step === "assessment" && (
        <div className="space-y-6">
          <div className="rounded-[16px] border border-board-border bg-board-surface px-6 py-7">
            <h2 className="text-2xl font-serif text-board-text mb-1">Judgement Assessment</h2>
            <p className="text-sm text-board-text-secondary mb-3">
              Read each scenario and choose the response closest to how you would actually act — not how you think you should act.
            </p>
            <p className="text-xs text-board-text-tertiary">
              {Object.keys(responses).length} of {PROFILE_QUESTION_BANK.length} answered
            </p>
          </div>

          <div className="space-y-4">
            {PROFILE_QUESTION_BANK.map((question, qi) => (
              <div
                key={question.id}
                className="rounded-[16px] border border-board-border bg-board-surface px-6 py-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 rounded-full bg-board-accent/10 px-2.5 py-0.5 text-xs font-medium text-board-accent">
                    {qi + 1}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-board-text-tertiary font-medium">
                    {question.category}
                  </span>
                </div>

                <p className="text-sm text-board-text font-medium mb-1.5">{question.scenario}</p>
                <p className="text-xs text-board-text-tertiary mb-4">{question.context}</p>

                <div className="space-y-2">
                  {question.options.map((option, oi) => {
                    const isSelected = responses[question.id] === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => handleResponse(question.id, oi)}
                        className={`w-full text-left rounded-[10px] border px-4 py-3 text-xs transition-all ${
                          isSelected
                            ? "border-board-accent bg-board-accent/10 text-board-text"
                            : "border-board-border text-board-text-secondary hover:border-board-accent/30 hover:bg-board-surface-raised"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("goals")}
              className="rounded-[12px] border border-board-border px-6 py-3.5 text-sm font-medium text-board-text-secondary transition-colors hover:bg-board-surface"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={!allQuestionsAnswered}
              className="flex-1 rounded-[12px] bg-board-accent px-6 py-3.5 text-sm font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90 disabled:opacity-50 disabled:bg-board-surface-raised disabled:text-board-text-secondary disabled:cursor-not-allowed"
            >
              View My Profile
            </button>
          </div>
        </div>
      )}

      {step === "complete" && existingProfile && (
        <ProfileComplete
          profile={existingProfile}
          onRetake={handleRetake}
          onGoToBoard={() => router.push("/board")}
        />
      )}

      {step === "complete" && !existingProfile && (
        <div className="text-center py-12 text-board-text-secondary">
          <p>No profile found. Something went wrong — please try again.</p>
          <button
            type="button"
            onClick={handleRetake}
            className="mt-4 text-board-accent hover:underline text-sm"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileComplete({
  profile,
  onRetake,
  onGoToBoard,
}: {
  profile: WebUserProfile;
  onRetake: () => void;
  onGoToBoard: () => void;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-[16px] border border-board-border bg-board-surface px-6 py-7">
        <h2 className="text-2xl font-serif text-board-text mb-1">
          {profile.name}&apos;s Judgement Profile
        </h2>
        <p className="text-sm text-board-text-secondary mb-6">
          Your advocate will champion your position using this profile to calibrate their arguments.
        </p>

        <RubricChart rubric={profile.rubric} />
      </div>

      <div className="rounded-[16px] border border-board-border bg-board-surface px-6 py-7">
        <h3 className="text-lg font-serif text-board-text mb-4">Profile Summary</h3>

        <div className="space-y-3 text-sm">
          <SummaryRow label="Background" value={profile.background} />
          <SummaryRow label="Seniority" value={profile.seniorityLevel} />
          <SummaryRow label="Domains" value={profile.experienceDomains.join(", ")} />
          <SummaryRow label="Primary Goal" value={profile.primaryGoal} />
          <SummaryRow label="Success Definition" value={profile.successDefinition} />
          <SummaryRow label="Time Horizon" value={profile.timeHorizon.replace(/_/g, " ")} />
          <SummaryRow label="Non-Negotiables" value={profile.nonNegotiables.join(", ")} />
          <SummaryRow label="Resource Limits" value={profile.resourceLimits} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="rounded-[12px] border border-board-border px-6 py-3.5 text-sm font-medium text-board-text-secondary transition-colors hover:bg-board-surface"
        >
          Retake Assessment
        </button>
        <button
          type="button"
          onClick={onGoToBoard}
          className="flex-1 rounded-[12px] bg-board-accent px-6 py-3.5 text-sm font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90"
        >
          Go to Board of Directors
        </button>
      </div>

      <p className="text-center text-xs text-board-text-tertiary">
        Your profile is saved locally. When you consult the board, a personalised advocate will join the discussion to champion your position.
      </p>
    </div>
  );
}

function ConflictNotice({
  conflicts,
  onReplace,
  onKeep,
}: {
  conflicts: Suggestion[];
  onReplace: () => void;
  onKeep: () => void;
}) {
  if (conflicts.length === 0) return null;
  return (
    <div
      role="status"
      className="rounded-[12px] border border-board-border bg-board-surface-raised px-5 py-4 text-sm"
    >
      <p className="text-board-text mb-1">
        We kept {conflicts.length === 1 ? "a field" : `${conflicts.length} fields`} you had already filled in:
      </p>
      <p className="text-xs text-board-text-secondary mb-3">
        {conflicts.map((c) => FIELD_LABELS[c.key]).join(", ")}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onReplace}
          className="text-xs font-medium text-board-accent hover:underline"
        >
          Replace with suggestions
        </button>
        <button
          type="button"
          onClick={onKeep}
          className="text-xs text-board-text-tertiary hover:text-board-text-secondary"
        >
          Keep mine
        </button>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  hint,
  suggested,
  children,
}: {
  label: string;
  hint?: string;
  suggested?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-board-text mb-1">
        {label}
        {suggested && (
          <span className="flex-shrink-0 rounded-full bg-board-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-board-accent">
            Suggested
          </span>
        )}
      </label>
      {hint && <p className="text-xs text-board-text-tertiary mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex-shrink-0 w-32 text-board-text-tertiary">{label}</span>
      <span className="text-board-text">{value}</span>
    </div>
  );
}
