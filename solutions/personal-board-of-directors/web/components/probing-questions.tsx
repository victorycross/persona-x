"use client";

import { useBoardContext } from "@/lib/board-context";
import type { ProbingAnswer, ProbingQuestion } from "@/lib/types";

const EMPTY_ANSWER: ProbingAnswer = { selected: [], other: "" };

export function ProbingQuestions() {
  const {
    probingQuestions,
    probingAnswers,
    setProbingAnswer,
    questionsLoading,
    enrichedDecision,
    startSession,
    setStep,
  } = useBoardContext();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("consulting_board");
    startSession(enrichedDecision);
  }

  function handleBack() {
    setStep("decision_input");
  }

  // Loading skeleton
  if (questionsLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <p className="text-xs uppercase tracking-widest text-board-text-tertiary font-sans">
          Refine Your Decision
        </p>
        <h2 className="text-2xl font-serif text-board-accent">
          Preparing questions...
        </h2>
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[16px] border border-board-border bg-board-surface px-6 py-5"
            >
              <div className="h-4 w-3/4 rounded bg-board-surface-raised animate-pulse" />
              <div className="mt-4 flex gap-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-8 w-24 rounded-full bg-board-surface-raised animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no questions were generated, auto-proceed
  if (probingQuestions.length === 0 && !questionsLoading) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-sm text-board-text-secondary">
          No additional questions needed.
        </p>
        <button
          onClick={handleSubmit}
          className="mt-4 rounded-[12px] bg-board-accent px-8 py-3 text-sm font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90"
        >
          Convene the Board
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <p className="text-xs uppercase tracking-widest text-board-text-tertiary font-sans">
        Refine Your Decision
      </p>
      <h2 className="text-2xl font-serif text-board-accent mt-1">
        A few quick questions
      </h2>
      <p className="text-sm text-board-text-secondary mt-2 mb-6">
        Tap the answers that fit. All optional — skip any that don&apos;t apply.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {probingQuestions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            answer={probingAnswers[q.id] ?? EMPTY_ANSWER}
            onChange={(answer) => setProbingAnswer(q.id, answer)}
          />
        ))}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-board-text-secondary hover:text-board-text transition-colors"
          >
            <span aria-hidden="true">&larr;</span> Edit decision
          </button>
          <button
            type="submit"
            className="rounded-[12px] bg-board-accent px-8 py-3 text-sm font-semibold text-board-accent-contrast transition-colors hover:bg-board-accent/90"
          >
            Convene the Board
          </button>
        </div>
      </form>
    </div>
  );
}

function QuestionCard({
  question,
  answer,
  onChange,
}: {
  question: ProbingQuestion;
  answer: ProbingAnswer;
  onChange: (answer: ProbingAnswer) => void;
}) {
  function toggle(option: string) {
    const isSelected = answer.selected.includes(option);
    const selected = question.multiSelect
      ? isSelected
        ? answer.selected.filter((o) => o !== option)
        : [...answer.selected, option]
      : isSelected
        ? []
        : [option];
    onChange({ ...answer, selected });
  }

  return (
    <div className="rounded-[16px] border border-board-border bg-board-surface px-6 py-5">
      <p id={`${question.id}-label`} className="text-sm font-medium text-board-text">
        {question.question}
      </p>
      {question.multiSelect && (
        <p className="mt-0.5 text-xs text-board-text-tertiary">Choose any that apply</p>
      )}

      <div
        role={question.multiSelect ? "group" : "radiogroup"}
        aria-labelledby={`${question.id}-label`}
        className="mt-3 flex flex-wrap gap-2"
      >
        {question.options.map((option) => {
          const isSelected = answer.selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              role={question.multiSelect ? "checkbox" : "radio"}
              aria-checked={isSelected}
              onClick={() => toggle(option)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "border-board-accent bg-board-accent/10 text-board-accent"
                  : "border-board-border text-board-text-secondary hover:border-board-accent/40"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        aria-label={`Your own answer: ${question.question}`}
        value={answer.other}
        onChange={(e) => onChange({ ...answer, other: e.target.value })}
        placeholder="Or add your own (optional)"
        maxLength={300}
        className="field-input mt-3 py-2"
      />
    </div>
  );
}
