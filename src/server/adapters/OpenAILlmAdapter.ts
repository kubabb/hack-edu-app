import OpenAI from 'openai';
import { LlmAdapter, LlmPrompt, LlmResponse } from './LlmAdapter';

export class OpenAILlmAdapter implements LlmAdapter {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(prompt: LlmPrompt): Promise<LlmResponse> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (prompt.system) {
      messages.push({ role: 'system', content: prompt.system });
    }
    for (const m of prompt.messages) {
      messages.push({ role: m.role, content: m.content });
    }
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    });
    const content = response.choices[0]?.message?.content ?? '';
    return { content };
  }
}
