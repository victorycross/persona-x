"use client";

import { BoardProvider, useBoardContext } from "@/lib/board-context";
import { StepIndicator } from "@/components/step-indicator";
import { DecisionInput } from "@/components/decision-input";
import { ProbingQuestions } from "@/components/probing-questions";
import { ConsultingLoading } from "@/components/consulting-loading";
import { PersonaPage } from "@/components/persona-page";
import { BoardBriefDisplay } from "@/components/board-brief";

function BoardFlow() {
  const { step, brief, sessionError, responses, profiles, briefLoading, setStep, setCurrentPersonaIndex } = useBoardContext();

  return (
    <div>
      <StepIndicator />

      {/* Error display */}
      {sessionError && (
        <div className="mb-6 rounded-[12px] border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
          {sessionError}
        </div>
      )}

      {step === "decision_input" && <DecisionInput />}
      {step === "probing_questions" && <ProbingQuestions />}
      {step === "consulting_board" && <ConsultingLoading />}
      {step === "persona_review" && <PersonaPage />}
      {step === "board_brief" && (
        <BoardBriefDisplay
          brief={brief}
          responses={responses}
          profiles={profiles}
          briefLoading={briefLoading}
          onBack={() => {
            setStep("persona_review");
            setCurrentPersonaIndex(responses.length - 1);
          }}
        />
      )}
    </div>
  );
}

export default function BoardPage() {
  return (
    <BoardProvider>
      <BoardFlow />
    </BoardProvider>
  );
}
