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

  private async tryGetNodeWithNeighbors(sessionId: string, nodeId?: string) {
    if (!nodeId) return null;

    try {
      const node = await this.nodeRepo.findByIdWithNeighbors(nodeId);
      if (node.sessionId !== sessionId) {
        return null;
      }
      return node;
    } catch {
      return null;
    }
  }

  async getContextForQuestion(sessionId: string, question: string, selectedNodeId?: string): Promise<string[]> {
    const contexts: string[] = [];

    // Context from selected node and its neighbors
    if (selectedNodeId) {
      const node = await this.tryGetNodeWithNeighbors(sessionId, selectedNodeId);
      if (node?.chunk) contexts.push(node.chunk.content);
      for (const edge of (node?.outgoing || []) as any[]) {
        if ((edge as any).target?.chunk) contexts.push((edge as any).target.chunk.content);
      }
      for (const edge of (node?.incoming || []) as any[]) {
        if ((edge as any).source?.chunk) contexts.push((edge as any).source.chunk.content);
      }
    }

    // Vector search for related chunks
    const [questionEmbedding] = await this.embeddingAdapter.embed([question]);
    const nearest = await this.embeddingRepo.findNearest(sessionId, new Float32Array(questionEmbedding), 5);
    for (const emb of nearest) {
      if (emb.chunk) contexts.push(emb.chunk.content);
    }

    return Array.from(new Set(contexts));
  }

  /** Get chunks related to a specific node and its graph neighbors */
  async getChunksForNode(sessionId: string, nodeId: string): Promise<string[]> {
    const node = await this.tryGetNodeWithNeighbors(sessionId, nodeId);
    const chunks: string[] = [];
    if (!node) return chunks;
    if (node.chunk) chunks.push(node.chunk.content);
    for (const edge of node.outgoing as any[]) {
      if ((edge as any).target?.chunk) chunks.push((edge as any).target.chunk.content);
    }
    for (const edge of node.incoming as any[]) {
      if ((edge as any).source?.chunk) chunks.push((edge as any).source.chunk.content);
    }
    return Array.from(new Set(chunks));
  }

  /** Pure vector search without graph context */
  async getChunksByQuery(sessionId: string, query: string, limit: number = 5): Promise<string[]> {
    const [queryEmbedding] = await this.embeddingAdapter.embed([query]);
    const nearest = await this.embeddingRepo.findNearest(sessionId, new Float32Array(queryEmbedding), limit);
    return nearest.filter(e => e.chunk).map(e => e.chunk!.content);
  }

  /** Hybrid: graph context + vector search, deduplicated by relevance */
  async getHybridContext(sessionId: string, query: string, nodeId?: string): Promise<{ content: string; source: string }[]> {
    const results: Map<string, { content: string; source: string }> = new Map();

    // Graph-based context
    if (nodeId) {
      const node = await this.tryGetNodeWithNeighbors(sessionId, nodeId);
      if (node?.chunk && !results.has('node')) {
        results.set('node', { content: node.chunk.content, source: `Węzeł: ${node.label}` });
      }
      for (const edge of (node?.outgoing || []) as any[]) {
        if ((edge as any).target?.chunk) {
          const key = (edge as any).target.id;
          if (!results.has(key)) {
            results.set(key, {
              content: (edge as any).target.chunk.content,
              source: `Powiązane: ${(edge as any).target.label || 'węzeł'} (${(edge as any).type || 'relacja'})`,
            });
          }
        }
      }
    }

    // Vector search with similarity
    const [queryEmbedding] = await this.embeddingAdapter.embed([query]);
    const nearest = await this.embeddingRepo.findNearest(sessionId, new Float32Array(queryEmbedding), 7);
    for (const emb of nearest) {
      if (emb.chunk) {
        const contentKey = emb.chunk.content.substring(0, 100);
        if (!results.has(contentKey)) {
          results.set(contentKey, {
            content: emb.chunk.content,
            source: 'Wyszukiwanie semantyczne',
          });
        }
      }
    }

    return Array.from(results.values());
  }
}
