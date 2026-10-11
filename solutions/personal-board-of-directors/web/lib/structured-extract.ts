import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { LLM_MODEL } from "./constants";

/**
 * Structured extraction via a forced tool call.
 *
 * The model must answer by calling a single tool whose input matches the
 * supplied JSON schema; the result is then validated with Zod. Used where the
 * input may be a document block (PDF), which the framework's text-only
 * `sendMessage` helper does not support.
 *
 * Retries: the SDK client retries rate limits and server errors with
 * exponential backoff (maxRetries: 2 → 3 attempts in total).
 */

export class ExtractionError extends Error {}

interface ExtractOptions<T> {
  system: string;
  content: Anthropic.MessageParam["content"];
  toolName: string;
  toolDescription: string;
  inputSchema: Anthropic.Tool.InputSchema;
  validator: z.ZodType<T>;
  maxTokens?: number;
}

export async function extractStructured<T>(options: ExtractOptions<T>): Promise<T> {
  const client = new Anthropic({ maxRetries: 2 });

  const response = await client.messages.create({
    model: LLM_MODEL,
    max_tokens: options.maxTokens ?? 1500,
    temperature: 0.2,
    system: options.system,
    tools: [
      {
        name: options.toolName,
        description: options.toolDescription,
        input_schema: options.inputSchema,
      },
    ],
    tool_choice: { type: "tool", name: options.toolName },
    messages: [{ role: "user", content: options.content }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) {
    throw new ExtractionError("The AI service did not return a structured result.");
  }

  const parsed = options.validator.safeParse(toolUse.input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ExtractionError(
      `Structured result failed validation at "${issue?.path.join(".") ?? "?"}": ${issue?.message ?? "unknown"}`
    );
  }
  return parsed.data;
}
