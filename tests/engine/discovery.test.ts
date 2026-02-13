import { describe, it, expect } from "vitest";
import {
  createDiscoveryState,
  hasSignalSufficiency,
  getMissingSignals,
  PRIORITY_SIGNALS,
  QUESTION_BANK,
} from "../../src/engine/discovery/discovery.js";
import type { ExtractedSignal } from "../../src/engine/discovery/discovery.js";

describe("Discovery State Machine", () => {
  it("starts in not_started phase", () => {
    const state = createDiscoveryState();
    expect(state.phase).toBe("not_started");
    expect(state.signals).toEqual([]);
  });

  it("reports insufficient signal with no data", () => {
    const state = createDiscoveryState();
    expect(hasSignalSufficiency(state)).toBe(false);
  });

  it("reports insufficient signal without purpose", () => {
    const state = createDiscoveryState();
    state.signals = [
      {
        signal: "discomfort_triggers",
        value: "Conservative risk stance",
        confidence: "high",
        source_question_id: "q1",
      },
      {
        signal: "evidence_change_thresholds",
        value: "Needs documented evidence",
        confidence: "high",
        source_question_id: "q2",
      },
      {
        signal: "ambiguity_handling",
        value: "Pushes for clarity",
        confidence: "high",
        source_question_id: "q3",
      },
    ];
    // Still insufficient because purpose is not set
    expect(hasSignalSufficiency(state)).toBe(false);
  });

  it("reports sufficient signal with purpose and 3 high-confidence signals", () => {
    const state = createDiscoveryState();
    state.persona_purpose = "Challenge assumptions and surface risks";
    state.signals = [
      {
        signal: "discomfort_triggers",
        value: "Conservative",
        confidence: "high",
        source_question_id: "q1",
      },
      {
        signal: "evidence_change_thresholds",
        value: "High threshold",
        confidence: "high",
        source_question_id: "q2",
      },
      {
        signal: "ambiguity_handling",
        value: "Prefers clarity",
        confidence: "medium",
        source_question_id: "q3",
      },
    ];
    expect(hasSignalSufficiency(state)).toBe(true);
  });

  it("identifies missing signals correctly", () => {
    const state = createDiscoveryState();
    state.signals = [
      {
        signal: "discomfort_triggers",
        value: "test",
        confidence: "high",
        source_question_id: "q1",
      },
    ];

    const missing = getMissingSignals(state);
    expect(missing).not.toContain("discomfort_triggers");
    expect(missing).toContain("evidence_change_thresholds");
    expect(missing).toContain("ambiguity_handling");
    expect(missing).toContain("pressure_behaviour");
    expect(missing).toContain("deferral_preferences");
  });
});

describe("Question Bank", () => {
  it("contains questions targeting all priority signals", () => {
    const targetedSignals = new Set<string>();
    for (const question of QUESTION_BANK) {
      for (const target of question.targets) {
        targetedSignals.add(target);
      }
    }

    for (const signal of PRIORITY_SIGNALS) {
      expect(targetedSignals.has(signal)).toBe(true);
    }
  });

  it("all questions have unique IDs", () => {
    const ids = QUESTION_BANK.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all questions have non-empty text", () => {
    for (const question of QUESTION_BANK) {
      expect(question.text.length).toBeGreaterThan(0);
    }
  });
});
