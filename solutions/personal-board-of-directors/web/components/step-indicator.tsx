"use client";

import { useBoardContext } from "@/lib/board-context";
import type { FlowStep } from "@/lib/types";

const FLOW_STEPS: FlowStep[] = [
  "decision_input",
  "probing_questions",
  "consulting_board",
  "persona_review",
  "board_brief",
];

const STEP_LABELS: Record<FlowStep, string> = {
  decision_input: "Describe Decision",
  probing_questions: "Refine Decision",
  consulting_board: "Consulting Board",
  persona_review: "Your Advisors",
  board_brief: "Board Brief",
};

const STEP_INDEX: Record<FlowStep, number> = {
  decision_input: 0,
  probing_questions: 1,
  consulting_board: 2,
  persona_review: 3,
  board_brief: 4,
};

export function StepIndicator() {
  const { step, responses, profiles } = useBoardContext();

  const activeIndex = STEP_INDEX[step];
  const total = Math.max(profiles.length, responses.length);
  const completeCount = responses.filter((r) => r.isComplete).length;

  return (
    <nav aria-label="Progress" className="mb-8">
      {/* Dots */}
      <div role="list" className="flex items-center justify-center gap-2 mb-2">
        {FLOW_STEPS.map((s, i) => (
          <div
            key={s}
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
              {STEP_LABELS[s]}{i < activeIndex ? " (completed)" : i === activeIndex ? " (current)" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* Advisor progress during persona_review */}
      {step === "persona_review" && total > 0 && (
        <div className="text-center">
          <p className="text-xs text-board-text-tertiary font-sans">
            {completeCount === total ? `All ${total} advisors have responded` : `${completeCount} of ${total} advisors have responded`}
          </p>
          <div className="mt-1.5 mx-auto max-w-[200px] h-0.5 rounded-full bg-board-border overflow-hidden">
            <div
              className="h-full rounded-full bg-board-accent transition-all duration-300"
              style={{ width: `${(completeCount / total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
