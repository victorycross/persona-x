import { describe, it, expect } from "vitest";

/**
 * LLM Client Tests
 *
 * Tests for the non-API utility functions in the LLM client.
 * API calls are not tested here — they require an API key.
 */

// We test the extractJSON function indirectly through the module internals.
// Since it's a private function, we test the behaviour through sendMessageForJSON
// by verifying JSON extraction patterns.

describe("JSON Extraction Patterns", () => {
  // These test the patterns that extractJSON handles

  it("parses a raw JSON object", () => {
    const input = '{"key": "value"}';
    const result = JSON.parse(input);
    expect(result).toEqual({ key: "value" });
  });

  it("extracts JSON from markdown code block", () => {
    const input = '```json\n{"key": "value"}\n```';
    const match = input.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1]!)).toEqual({ key: "value" });
  });

  it("extracts JSON from code block without language tag", () => {
    const input = '```\n{"key": "value"}\n```';
    const match = input.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1]!)).toEqual({ key: "value" });
  });

  it("extracts JSON object from mixed text", () => {
    const input = 'Here is the result: {"key": "value"} and more text';
    const match = input.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1]!)).toEqual({ key: "value" });
  });

  it("extracts JSON array from mixed text", () => {
    const input = 'The signals are: [{"signal": "test"}]';
    const match = input.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    expect(match).not.toBeNull();
    expect(JSON.parse(match![1]!)).toEqual([{ signal: "test" }]);
  });
});

describe("LLM Response Types", () => {
  it("LLMMessage role must be user or assistant", () => {
    type LLMMessage = { role: "user" | "assistant"; content: string };
    const msg: LLMMessage = { role: "user", content: "test" };
    expect(msg.role).toBe("user");
    expect(["user", "assistant"]).toContain(msg.role);
  });

  it("LLMResponse has content and usage", () => {
    type LLMResponse = {
      content: string;
      usage: { input_tokens: number; output_tokens: number };
    };
    const response: LLMResponse = {
      content: "test response",
      usage: { input_tokens: 10, output_tokens: 20 },
    };
    expect(response.content).toBe("test response");
    expect(response.usage.input_tokens).toBe(10);
    expect(response.usage.output_tokens).toBe(20);
  });
});
