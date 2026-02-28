"use client";

import { useTeamContext } from "@/lib/team-context";
import {
  TEAM_PERSONA_CATALOGUE,
  estimateCost,
} from "@/lib/team-personas";
import { ROLE_BADGE_COLORS, DEFAULT_BADGE_COLOR } from "@/lib/constants";

export function PersonaSelector() {
  const { selectedPersonaIds, togglePersona, setStep } = useTeamContext();

  const count = selectedPersonaIds.length;
  const cost = estimateCost(count);
  const canContinue = count >= 2;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-serif text-board-text mb-1">
        Assemble Your Software Team
      </h2>
      <p className="text-sm text-board-text-secondary mb-6">
        Select the team members whose perspectives you want on your project. Each brings a distinct role-based lens. Minimum 2 required.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {TEAM_PERSONA_CATALOGUE.map((persona) => {
          const isSelected = selectedPersonaIds.includes(persona.id);
          const badgeColor =
            ROLE_BADGE_COLORS[persona.contributionType] ?? DEFAULT_BADGE_COLOR;

          return (
            <button
              key={persona.id}
              onClick={() => togglePersona(persona.id)}
              className={[
                "text-left rounded-xl border px-4 py-4 transition-all",
                isSelected
                  ? "border-board-accent bg-board-accent/5 shadow-sm"
                  : "border-board-border bg-board-surface hover:border-board-accent/40 hover:bg-board-surface",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    isSelected
                      ? "border-board-accent bg-board-accent"
                      : "border-board-border bg-board-bg",
                  ].join(" ")}
                  aria-hidden
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3 text-board-accent-contrast"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-board-text">
                      {persona.name}
                    </span>
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${badgeColor}`}
                    >
                      {persona.contributionType}
                    </span>
                  </div>
                  <p className="text-xs text-board-text-secondary leading-snug">
                    {persona.tagline}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 -mx-6 bg-board-bg/95 backdrop-blur-sm border-t border-board-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-board-text-secondary">
            {count === 0 ? (
              <span className="text-board-text-tertiary">No team members selected</span>
            ) : (
              <>
                <span className="font-semibold text-board-text">{count}</span>{" "}
                {count === 1 ? "member" : "members"} selected
                {" · "}
                <span className="text-board-text-tertiary">
                  ~${cost.toFixed(2)} estimated
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setStep("project_input")}
            disabled={!canContinue}
            className="rounded-xl bg-board-accent px-5 py-2.5 text-sm font-semibold text-board-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
