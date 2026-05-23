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
    try {
      const embeddings = await this.embeddingAdapter.embed(texts);
      if (!embeddings || embeddings.length === 0) {
        console.warn('Embedding API returned empty — skipping vector storage');
        return;
      }
      const items = chunks.map((chunk, i) => ({
        chunkId: chunk.id,
        vector: new Float32Array(embeddings[i] || []),
        provider: 'openai' as const,
      }));
      await this.embeddingRepo.batchCreate(items);
    } catch (e) {
      console.error('Embedding failed (non-critical, continuing):', e?.message || e);
    }
  }
}
