import OpenAI from 'openai';

/**
 * Detects OpenRouter API keys (sk-or-v1-...) and configures the
 * OpenAI client to use the OpenRouter endpoint instead of api.openai.com.
 * OpenRouter is OpenAI-compatible — but model names must be prefixed.
 */
export function isOpenRouterKey(key: string): boolean {
  return key.startsWith('sk-or-v1');
}

/**
 * Maps OpenAI model names to OpenRouter-prefixed equivalents.
 * OpenRouter requires 'openai/gpt-4o-mini' not just 'gpt-4o-mini'.
 */
export function resolveModel(model: string, key: string): string {
  if (isOpenRouterKey(key)) {
    // If already prefixed with a provider, use as-is
    if (model.includes('/')) return model;
    // Map known OpenAI models to OpenRouter paths
    const modelMap: Record<string, string> = {
      'gpt-4o-mini': 'openai/gpt-4o-mini',
      'gpt-4o': 'openai/gpt-4o',
      'gpt-4-turbo': 'openai/gpt-4-turbo',
      'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
      'text-embedding-ada-002': 'openai/text-embedding-ada-002',
      'text-embedding-3-small': 'openai/text-embedding-3-small',
      'text-embedding-3-large': 'openai/text-embedding-3-large',
      'whisper-1': 'openai/whisper-1',
    };
    return modelMap[model] || model;
  }
  return model;
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
