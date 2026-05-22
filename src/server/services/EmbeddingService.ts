import { BookChunkRepository } from '../repositories/BookChunkRepository';
import { EmbeddingRepository } from '../repositories/EmbeddingRepository';
import { EmbeddingAdapter } from '../adapters/EmbeddingAdapter';

export class EmbeddingService {
  constructor(
    private chunkRepo: BookChunkRepository,
    private embeddingRepo: EmbeddingRepository,
    private embeddingAdapter: EmbeddingAdapter
  ) {}

  async embedBookChunks(bookId: string) {
    const chunks = await this.chunkRepo.findByBookId(bookId);
    if (chunks.length === 0) return;
    const texts = chunks.map((c) => c.content);
    const embeddings = await this.embeddingAdapter.embed(texts);
    const vectors = embeddings.map((emb) => Buffer.from(new Float32Array(emb).buffer));
    await this.embeddingRepo.batchCreate(
      chunks.map((chunk, i) => ({
        chunkId: chunk.id,
        vector: vectors[i],
        provider: 'openai',
      }))
    );
  }
}
