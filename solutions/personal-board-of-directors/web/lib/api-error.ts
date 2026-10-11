import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/**
 * API Error Utilities
 *
 * Centralises error classification for every route that calls the AI service,
 * whether it returns JSON or streams events. Users get a plain message (never
 * raw SDK output); setup problems carry a short code the site owner can match
 * against the server log, which records what to fix.
 *
 *   503 — setup problem (AI_KEY_*, AI_PERMISSION_DENIED, AI_MODEL_UNAVAILABLE,
 *         AI_BILLING) or service unavailable (AI_UNAVAILABLE)
 *   429 — rate limit reached (AI_RATE_LIMITED)
 *   400 — the AI service rejected the request content (AI_BAD_REQUEST)
 *   500 — unexpected server error (UNEXPECTED)
 */

export type AIErrorCode =
  | "AI_KEY_MISSING"
  | "AI_KEY_INVALID"
  | "AI_KEY_NO_WORKSPACE"
  | "AI_PERMISSION_DENIED"
  | "AI_MODEL_UNAVAILABLE"
  | "AI_BILLING"
  | "AI_RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "AI_BAD_REQUEST"
  | "UNEXPECTED";

export interface DescribedAIError {
  code: AIErrorCode;
  status: number;
  /** Safe to show to end users. */
  message: string;
  /** True when the site's configuration must change before any AI call can succeed. */
  setup: boolean;
}

const SETUP_ADMIN_HINTS: Partial<Record<AIErrorCode, string>> = {
  AI_KEY_MISSING:
    "ANTHROPIC_API_KEY is not set for this environment. Add it in Vercel → Settings → Environment Variables, then redeploy.",
  AI_KEY_INVALID:
    "ANTHROPIC_API_KEY was rejected as invalid (401). Re-enter a current key, then redeploy.",
  AI_KEY_NO_WORKSPACE:
    "The API key is not scoped to a workspace. Create the key inside a workspace in the Anthropic Console, then redeploy.",
  AI_PERMISSION_DENIED:
    "The API key does not have permission for this request (403). Check the key's workspace and organisation settings.",
  AI_MODEL_UNAVAILABLE:
    "The configured model is not available to this key. Check LLM_MODEL in lib/constants.ts and the model in src/llm/client.ts.",
  AI_BILLING:
    "The Anthropic account or workspace is out of credit or has reached its spend limit.",
};

function setupError(code: AIErrorCode): DescribedAIError {
  return {
    code,
    status: 503,
    message: `The AI service isn't set up correctly on this site, so we can't generate a response right now. Please let the site owner know (error code: ${code}).`,
    setup: true,
  };
}

/**
 * Read the HTTP status from an SDK error. Checked structurally rather than with
 * `instanceof`, because the framework's LLM client (src/llm) is bundled with its
 * own copy of the SDK classes, so its errors are not instances of the classes
 * imported here.
 */
function apiStatus(err: unknown): number | undefined {
  if (err instanceof Anthropic.APIError) return err.status;
  const status = (err as { status?: unknown } | null)?.status;
  return typeof status === "number" ? status : undefined;
}

function isConnectionError(err: unknown, text: string): boolean {
  if (
    err instanceof Anthropic.APIConnectionError ||
    err instanceof Anthropic.APIConnectionTimeoutError
  ) {
    return true;
  }
  // SDK defaults for APIConnectionError / APIConnectionTimeoutError
  return text === "connection error." || text === "request timed out.";
}

function classify(err: unknown): DescribedAIError {
  const raw = err instanceof Error ? err.message : String(err);
  const text = raw.toLowerCase();

  // Thrown by the SDK constructor before any request is made
  if (text.includes("anthropic_api_key")) return setupError("AI_KEY_MISSING");

  const status = apiStatus(err);

  if (status === undefined && isConnectionError(err, text)) {
    return {
      code: "AI_UNAVAILABLE",
      status: 503,
      message: "Could not reach the AI service. Please try again shortly.",
      setup: false,
    };
  }

  if (status !== undefined) {
    if (status === 401) return setupError("AI_KEY_INVALID");
    if (status === 403) return setupError("AI_PERMISSION_DENIED");
    if (status === 404 && text.includes("model")) return setupError("AI_MODEL_UNAVAILABLE");
    if (status === 400 && text.includes("workspace")) return setupError("AI_KEY_NO_WORKSPACE");
    if (status === 400 && (text.includes("credit balance") || text.includes("billing"))) {
      return setupError("AI_BILLING");
    }
    if (status === 429) {
      return {
        code: "AI_RATE_LIMITED",
        status: 429,
        message: "The AI service is busy — please try again in a moment.",
        setup: false,
      };
    }
    if (status === 400 || status === 413) {
      return {
        code: "AI_BAD_REQUEST",
        status: 400,
        message: "The AI service couldn't process this request. Please check your input and try again.",
        setup: false,
      };
    }
    if (status >= 500) {
      return {
        code: "AI_UNAVAILABLE",
        status: 503,
        message: "The AI service is temporarily unavailable. Please try again shortly.",
        setup: false,
      };
    }
  }

  return {
    code: "UNEXPECTED",
    status: 500,
    message: "An unexpected error occurred. Please try again.",
    setup: false,
  };
}

/**
 * Classify an error from an AI call and log it server-side. Setup errors are
 * logged with what the site owner needs to change.
 */
export function describeAIError(err: unknown, context = "api"): DescribedAIError {
  const described = classify(err);
  const raw = err instanceof Error ? err.message : String(err);
  const hint = SETUP_ADMIN_HINTS[described.code];
  if (hint) {
    console.error(`[${context}] ${described.code}: ${hint} — ${raw}`);
  } else {
    console.error(`[${context}] ${described.code}:`, err);
  }
  return described;
}

/** User-facing message for an error, for streamed responses. */
export function userFacingErrorMessage(err: unknown, context?: string): string {
  return describeAIError(err, context).message;
}

/**
 * Pre-flight check: return a 503 response if ANTHROPIC_API_KEY is not set.
 * Call at the top of each route handler before any LLM work.
 * Returns null when the key is present.
 */
export function checkApiKey(): NextResponse | null {
  if (!process.env.ANTHROPIC_API_KEY) {
    const described = setupError("AI_KEY_MISSING");
    console.error(`[api] AI_KEY_MISSING: ${SETUP_ADMIN_HINTS.AI_KEY_MISSING}`);
    return NextResponse.json(
      { error: described.message, code: described.code },
      { status: described.status }
    );
  }
  return null;
}

/**
 * Classify an error thrown by an AI call and return a NextResponse with the
 * matching status code, a user-friendly message, and an error code.
 */
export function apiErrorResponse(err: unknown, context?: string): NextResponse {
  const described = describeAIError(err, context);
  return NextResponse.json(
    { error: described.message, code: described.code },
    { status: described.status }
  );
}
