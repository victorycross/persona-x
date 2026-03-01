"use client";

import { useTeamContext } from "@/lib/team-context";
import { TEAM_PERSONA_CATALOGUE, estimateCost } from "@/lib/team-personas";

const PLACEHOLDER =
  `Describe the software project you want the team to evaluate. Be specific about what you want to build, the problem it solves, and your target users.\n\nExample: "We want to build a mobile app that helps freelancers track their time and invoice clients automatically. The app should integrate with Xero and support multiple currencies."`;

export function ProjectInput() {
  const {
    projectBrief,
    setProjectBrief,
    selectedPersonaIds,
    startFounderSession,
    setStep,
  } = useTeamContext();

  const selectedNames = TEAM_PERSONA_CATALOGUE.filter((p) =>
    selectedPersonaIds.includes(p.id)
  ).map((p) => p.name);

  const cost = estimateCost(selectedPersonaIds.length);

  function handleSubmit() {
    const trimmed = projectBrief.trim();
    if (!trimmed) return;
    startFounderSession();
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-serif text-board-text mb-1">
        Describe Your Project
      </h2>
      <p className="text-sm text-board-text-secondary mb-6">
        Your selected team will each respond from their role's perspective.
      </p>

      {/* Selected team summary */}
      <div className="mb-5 rounded-xl border border-board-border bg-board-surface px-4 py-3">
        <p className="text-xs font-medium text-board-text-tertiary mb-2">
          Selected team ({selectedPersonaIds.length} members · ~${cost.toFixed(2)} estimated)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {selectedNames.map((name) => (
            <span
              key={name}
              className="rounded-full bg-board-accent/10 px-2.5 py-0.5 text-xs font-medium text-board-accent"
            >
              {name}
            </span>
          ))}
        </div>
        <button
          onClick={() => setStep("persona_select")}
          className="mt-2 text-xs text-board-text-tertiary underline hover:text-board-text-secondary transition-colors"
        >
          Change selection
        </button>
      </div>

      <textarea
        className="w-full rounded-xl border border-board-border bg-board-surface px-4 py-3 text-sm text-board-text placeholder-board-text-tertiary focus:outline-none focus:ring-2 focus:ring-board-accent/40 resize-none transition-shadow"
        rows={8}
        maxLength={5000}
        placeholder={PLACEHOLDER}
        value={projectBrief}
        onChange={(e) => setProjectBrief(e.target.value)}
        aria-label="Project description"
      />
      <div className="mt-1 flex items-center justify-between text-xs text-board-text-tertiary">
        <span>{projectBrief.length.toLocaleString()} / 5,000 characters</span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!projectBrief.trim()}
        className="mt-4 w-full rounded-xl bg-board-accent px-6 py-3 text-sm font-semibold text-board-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Consult the Team
      </button>
    </div>
  );
}
