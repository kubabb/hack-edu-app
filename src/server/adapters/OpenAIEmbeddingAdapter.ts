import { EmbeddingAdapter } from './EmbeddingAdapter';
import { createOpenAIClient } from '../lib/openai-client';

export class OpenAIEmbeddingAdapter implements EmbeddingAdapter {
  private client: ReturnType<typeof createOpenAIClient>;

  constructor(apiKey: string) {
    this.client = createOpenAIClient(apiKey);
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texts,
    });
    return response.data.map((d) => d.embedding);
  }
}
