// LLM Client - Anthropic Claude API Integration

import type Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

async function getAnthropicClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Anthropic SDK is not available in the browser');
  }

  if (!anthropicClient) {
    const { default: AnthropicSDK } = await import('@anthropic-ai/sdk');
    anthropicClient = new AnthropicSDK({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  return anthropicClient;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface LLMResponse {
  text: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call Claude API with a prompt and retry logic for rate limits
 */
export async function callClaude(
  prompt: string,
  maxTokens: number = 2000,
  temperature: number = 0.7
): Promise<LLMResponse> {
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 2000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (typeof window !== 'undefined') {
        throw new Error('Claude API cannot be called from the browser runtime');
      }

      console.log(`[LLM] Calling Claude (attempt ${attempt + 1}/${MAX_RETRIES}) with ${prompt.length} chars, max_tokens: ${maxTokens}`);
      const startTime = Date.now();

      const anthropic = await getAnthropicClient();
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        temperature,
        system: 'You are a JSON API. Always reply with a single valid JSON object only, no prose, no code fences. Ensure JSON is complete.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      console.log(`[LLM] Response received in ${duration}ms, tokens: ${message.usage.input_tokens} in / ${message.usage.output_tokens} out`);

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return {
        text: content.text,
        usage: {
          input_tokens: message.usage.input_tokens,
          output_tokens: message.usage.output_tokens,
        },
      };
    } catch (error: any) {
      const isRateLimit = error?.status === 429;
      const isLastAttempt = attempt === MAX_RETRIES - 1;

      if (isRateLimit && !isLastAttempt) {
        // Get retry-after header or use exponential backoff
        const retryAfter = error?.headers?.['retry-after'];
        const delayMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : BASE_DELAY_MS * Math.pow(2, attempt);

        console.log(`[LLM] Rate limited (429). Waiting ${delayMs}ms before retry ${attempt + 2}/${MAX_RETRIES}...`);
        await sleep(delayMs);
        continue;
      }

      console.error('Claude API error:', error);

      // Return fallback response for demo/development or after all retries exhausted
      if (process.env.NODE_ENV === 'development' || isLastAttempt) {
        console.log('[LLM] Returning fallback response');
        return {
          text: JSON.stringify({
            reasoning: 'Fallback: API unavailable or rate limited',
            decision: {},
            torontoContext: ['Fallback mode active'],
          }),
        };
      }

      throw error;
    }
  }

  // Should never reach here, but TypeScript needs this
  return {
    text: JSON.stringify({
      reasoning: 'Fallback: Max retries exceeded',
      decision: {},
      torontoContext: ['Fallback mode active'],
    }),
  };
}

/**
 * Attempt to repair truncated JSON by closing open brackets/braces
 */
function repairTruncatedJSON(text: string): string {
  let repaired = text.trim();

  // Count open vs closed brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (const char of repaired) {
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{') openBraces++;
    else if (char === '}') openBraces--;
    else if (char === '[') openBrackets++;
    else if (char === ']') openBrackets--;
  }

  // If we're in a string, close it
  if (inString) {
    repaired += '"';
  }

  // Close any open brackets/braces
  while (openBrackets > 0) {
    repaired += ']';
    openBrackets--;
  }
  while (openBraces > 0) {
    repaired += '}';
    openBraces--;
  }

  return repaired;
}

/**
 * Parse JSON from Claude response
 * Claude sometimes wraps JSON in markdown or adds explanation text
 */
export function parseJSONFromResponse(text: string): any {
  // Try to find JSON in the response
  // Look for { ... } pattern
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('No JSON found in Claude response:', text);
    // Return a minimal valid object
    return {
      reasoning: 'Failed to parse response',
      decision: {},
      torontoContext: ['Parse error - fallback mode'],
    };
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn('Initial JSON parse failed, attempting repair...');

    // Try to repair truncated JSON
    try {
      const repaired = repairTruncatedJSON(jsonMatch[0]);
      const parsed = JSON.parse(repaired);
      console.log('Successfully repaired truncated JSON');
      return parsed;
    } catch (repairError) {
      console.error('Failed to parse or repair JSON from Claude. Raw text:', text);
      console.error('Extracted JSON fragment:', jsonMatch[0]);

      // Return a minimal valid object instead of throwing
      return {
        reasoning: 'Response parsing failed - using fallback',
        decision: {},
        torontoContext: ['Parse error - fallback mode'],
      };
    }
  }
}

/**
 * Call agent with structured prompt and expect JSON response
 */
export async function callAgentLLM(
  agentId: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<any> {
  const response = await callClaude(prompt, maxTokens);
  return parseJSONFromResponse(response.text);
}
