export interface LlmMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LlmPrompt {
  system?: string;
  messages: LlmMessage[];
}

export interface LlmResponse {
  content: string;
}

export interface LlmAdapter {
  complete(prompt: LlmPrompt): Promise<LlmResponse>;
}
