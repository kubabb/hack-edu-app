import { EmbeddingAdapter } from './EmbeddingAdapter';
import { createOpenAIClient, resolveModel } from '../lib/openai-client';

export class OpenAIEmbeddingAdapter implements EmbeddingAdapter {
  private client: ReturnType<typeof createOpenAIClient>;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = createOpenAIClient(apiKey);
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: resolveModel('text-embedding-ada-002', this.apiKey),
      input: texts,
    });
    return (response.data || []).map((d: any) => d.embedding || []);
  }
}
