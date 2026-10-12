/**
 * Extract and parse a JSON object from LLM text output.
 *
 * Tolerates markdown code fences (including an unclosed opening fence) and
 * text before or after the object by taking everything from the first "{" to
 * the last "}". Throws a descriptive error when no complete object is found —
 * usually a sign the response was cut off at the token limit.
 */
export function parseJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new SyntaxError(`No JSON object found in model output: ${text.slice(0, 120)}`);
  }
  const parsed: unknown = JSON.parse(text.slice(start, end + 1));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new SyntaxError("Model output JSON is not an object");
  }
  return parsed as Record<string, unknown>;
}

/**
 * Run a generate-and-parse step, retrying once if the output can't be parsed.
 * API errors (auth, rate limit, …) are not retried here; the SDK client
 * already retries transient failures.
 */
export async function withParseRetry<T>(generate: () => Promise<string>, parse: (text: string) => T): Promise<T> {
  const first = await generate();
  try {
    return parse(first);
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err;
    console.warn("[llm-json] unparseable model output, retrying once:", err.message);
    return parse(await generate());
  }
}
