import { GraphNodeRepository } from '../repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '../repositories/GraphEdgeRepository';
import { SessionChunkRepository } from '../repositories/SessionChunkRepository';
import { EmbeddingRepository } from '../repositories/EmbeddingRepository';

export class GraphBuilderService {
  constructor(
    private nodeRepo: GraphNodeRepository,
    private edgeRepo: GraphEdgeRepository,
    private chunkRepo: SessionChunkRepository,
    private embeddingRepo: EmbeddingRepository
  ) {}

  async buildGraph(sessionId: string) {
    const chunks = await this.chunkRepo.findBySessionId(sessionId);
    if (chunks.length === 0) return;

    const nodes = await this.nodeRepo.createMany(
      chunks.map((c) => ({
        sessionId,
        chunkId: c.id,
        type: this.inferNodeType(c.type),
        label: c.content.substring(0, 100),
      }))
    );

    const edges: { sessionId: string; sourceId: string; targetId: string; type: string; weight: number }[] = [];

    // Structural edges: NEXT
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({ sessionId, sourceId: nodes[i].id, targetId: nodes[i + 1].id, type: 'NEXT', weight: 1.0 });
    }

    // Similarity edges: SIMILAR (placeholder until pgvector cosine query is wired)
    // TODO: replace with actual vector similarity search
    const vectors = await this.embeddingRepo.findBySessionId(sessionId);
    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const sim = this.cosineSimilarity(
          new Float32Array(vectors[i].vector.buffer),
          new Float32Array(vectors[j].vector.buffer)
        );
        if (sim > 0.8) {
          edges.push({ sessionId, sourceId: nodes[i].id, targetId: nodes[j].id, type: 'SIMILAR', weight: sim });
        }
      }
    }

    if (edges.length > 0) {
      await this.edgeRepo.createMany(edges);
    }
  }

  private inferNodeType(chunkType: string): string {
    switch (chunkType) {
      case 'TASK': return 'TASK';
      case 'THEORY': return 'CONCEPT';
      case 'EXAMPLE': return 'SECTION';
      default: return 'CONCEPT';
    }
  }

  private cosineSimilarity(a: Float32Array, b: Float32Array): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }
}
