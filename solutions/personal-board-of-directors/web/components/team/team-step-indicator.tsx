"use client";

import { useTeamContext } from "@/lib/team-context";
import type { TeamFlowStep } from "@/lib/team-types";

const STEPS: { key: TeamFlowStep; label: string }[] = [
  { key: "persona_select", label: "Select Team" },
  { key: "project_input", label: "Describe Project" },
  { key: "consulting_team", label: "Consulting" },
  { key: "team_review", label: "Review" },
  { key: "team_brief", label: "Team Brief" },
];

const STEP_INDEX: Record<TeamFlowStep, number> = {
  persona_select: 0,
  project_input: 1,
  consulting_team: 2,
  team_review: 3,
  team_brief: 4,
};

export function TeamStepIndicator() {
  const { step, currentMemberIndex, responses, selectedPersonaIds } =
    useTeamContext();

  const activeIndex = STEP_INDEX[step];

  return (
    <nav aria-label="Progress" className="mb-8">
      <div role="list" className="flex items-center justify-center gap-2 mb-2">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            role="listitem"
            aria-current={i === activeIndex ? "step" : undefined}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < activeIndex
                ? "w-1.5 bg-board-accent"
                : i === activeIndex
                ? "w-6 bg-board-accent"
                : "w-1.5 bg-board-text-tertiary/40"
            }`}
          >
            <span className="sr-only">
              {s.label}
              {i < activeIndex ? " (completed)" : i === activeIndex ? " (current)" : ""}
            </span>
          </div>
        ))}
      </div>

      {step === "team_review" && responses.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-board-text-tertiary font-sans">
            Team member {currentMemberIndex + 1} of{" "}
            {Math.max(responses.length, selectedPersonaIds.length)}
          </p>
          <div className="mt-1.5 mx-auto max-w-[200px] h-0.5 rounded-full bg-board-border overflow-hidden">
            <div
              className="h-full rounded-full bg-board-accent transition-all duration-300"
              style={{
                width: `${
                  ((currentMemberIndex + 1) /
                    Math.max(selectedPersonaIds.length, 1)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
