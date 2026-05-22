import OpenAI from 'openai';
import { EmbeddingAdapter } from './EmbeddingAdapter';

export class OpenAIEmbeddingAdapter implements EmbeddingAdapter {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texts,
    });
    return response.data.map((d) => d.embedding);
  }
}
