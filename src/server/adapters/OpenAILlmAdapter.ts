import { LlmAdapter, LlmPrompt, LlmResponse } from './LlmAdapter';
import { createOpenAIClient } from '../lib/openai-client';

export class OpenAILlmAdapter implements LlmAdapter {
  private client: ReturnType<typeof createOpenAIClient>;

  constructor(apiKey: string) {
    this.client = createOpenAIClient(apiKey);
  }

  async complete(prompt: LlmPrompt): Promise<LlmResponse> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (prompt.system) {
      messages.push({ role: 'system', content: prompt.system });
    }

    for (const m of prompt.messages) {
      messages.push({ role: m.role, content: m.content });
    }

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_completion_tokens: 2000,
    });

    return { content: response.choices[0]?.message?.content || '' };
  }
}
