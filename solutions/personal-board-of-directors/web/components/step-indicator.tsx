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

const STEP_INDEX: Record<FlowStep, number> = {
  decision_input: 0,
  probing_questions: 1,
  consulting_board: 2,
  persona_review: 3,
  board_brief: 4,
};

export function StepIndicator() {
  const { step, currentPersonaIndex, responses } = useBoardContext();

  const activeIndex = STEP_INDEX[step];

  return (
    <div className="mb-8">
      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {FLOW_STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < activeIndex
                ? "w-1.5 bg-board-accent"
                : i === activeIndex
                  ? "w-6 bg-board-accent"
                  : "w-1.5 bg-board-text-tertiary/40"
            }`}
          />
        ))}
      </div>

      {/* Persona progress bar during persona_review */}
      {step === "persona_review" && responses.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-board-text-tertiary font-sans">
            Advisor {currentPersonaIndex + 1} of {Math.max(responses.length, 8)}
          </p>
          <div className="mt-1.5 mx-auto max-w-[200px] h-0.5 rounded-full bg-board-border overflow-hidden">
            <div
              className="h-full rounded-full bg-board-accent transition-all duration-300"
              style={{
                width: `${((currentPersonaIndex + 1) / 8) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
