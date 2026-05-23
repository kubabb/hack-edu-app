import OpenAI from 'openai';

/**
 * Detects OpenRouter API keys (sk-or-v1-...) and configures the
 * OpenAI client to use the OpenRouter endpoint instead of api.openai.com.
 * OpenRouter is OpenAI-compatible — model names and API work identically.
 */
export function isOpenRouterKey(key: string): boolean {
  return key.startsWith('sk-or-v1');
}

export function createOpenAIClient(key: string): OpenAI {
  if (isOpenRouterKey(key)) {
    return new OpenAI({
      apiKey: key,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  return new OpenAI({ apiKey: key });
}
