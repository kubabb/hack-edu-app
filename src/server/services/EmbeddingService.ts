import { SessionChunkRepository } from '../repositories/SessionChunkRepository';
import { EmbeddingRepository } from '../repositories/EmbeddingRepository';
import { EmbeddingAdapter } from '../adapters/EmbeddingAdapter';

export class EmbeddingService {
  constructor(
    private chunkRepo: SessionChunkRepository,
    private embeddingRepo: EmbeddingRepository,
    private embeddingAdapter: EmbeddingAdapter
  ) {}

  async embedSessionChunks(sessionId: string) {
    const chunks = await this.chunkRepo.findBySessionId(sessionId);
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
