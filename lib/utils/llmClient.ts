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

export interface LLMResponse {
  text: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call Claude API with a prompt
 */
export async function callClaude(
  prompt: string,
  maxTokens: number = 2000,
  temperature: number = 0.7
): Promise<LLMResponse> {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Claude API cannot be called from the browser runtime');
    }

    const anthropic = await getAnthropicClient();
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

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
    console.error('Claude API error:', error);

    // Return fallback response for demo/development
    if (process.env.NODE_ENV === 'development') {
      return {
        text: JSON.stringify({
          reasoning: 'Development mode: API key not configured',
          decision: {},
          torontoContext: ['Demo mode active'],
        }),
      };
    }

    throw error;
  }
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
    throw new Error('No JSON found in Claude response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse JSON from Claude:', jsonMatch[0]);
    throw new Error('Invalid JSON in Claude response');
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
