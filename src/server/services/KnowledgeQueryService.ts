import { EmbeddingAdapter } from '../adapters/EmbeddingAdapter';
import { EmbeddingRepository } from '../repositories/EmbeddingRepository';
import { GraphNodeRepository } from '../repositories/GraphNodeRepository';
import { SessionChunkRepository } from '../repositories/SessionChunkRepository';

export class KnowledgeQueryService {
  constructor(
    private embeddingAdapter: EmbeddingAdapter,
    private embeddingRepo: EmbeddingRepository,
    private nodeRepo: GraphNodeRepository,
    private chunkRepo: SessionChunkRepository
  ) {}

  async getContextForQuestion(sessionId: string, question: string, selectedNodeId?: string): Promise<string[]> {
    const contexts: string[] = [];

    if (selectedNodeId) {
      const node = await this.nodeRepo.findByIdWithNeighbors(selectedNodeId);
      if (node.chunk) contexts.push(node.chunk.content);
      for (const edge of node.outgoing as any[]) {
        if ((edge as any).target?.chunk) contexts.push((edge as any).target.chunk.content);
      }
      for (const edge of node.incoming as any[]) {
        if ((edge as any).source?.chunk) contexts.push((edge as any).source.chunk.content);
      }
    }

    const [questionEmbedding] = await this.embeddingAdapter.embed([question]);
    const vector = Buffer.from(new Float32Array(questionEmbedding).buffer);
    const nearest = await this.embeddingRepo.findNearest(sessionId, vector, 5);
    for (const emb of nearest) {
      if (emb.chunk) contexts.push(emb.chunk.content);
    }

    return [...new Set(contexts)];
  }
}
