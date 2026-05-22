import { GraphNodeRepository } from '../repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '../repositories/GraphEdgeRepository';
import { BookChunkRepository } from '../repositories/BookChunkRepository';
import { EmbeddingRepository } from '../repositories/EmbeddingRepository';

export class GraphBuilderService {
  constructor(
    private nodeRepo: GraphNodeRepository,
    private edgeRepo: GraphEdgeRepository,
    private chunkRepo: BookChunkRepository,
    private embeddingRepo: EmbeddingRepository
  ) {}

  async buildGraph(bookId: string) {
    const chunks = await this.chunkRepo.findByBookId(bookId);
    if (chunks.length === 0) return;

    const nodes = await this.nodeRepo.createMany(
      chunks.map((c) => ({
        bookId,
        chunkId: c.id,
        type: this.inferNodeType(c.type),
        label: c.content.substring(0, 100),
      }))
    );

    const edges: { bookId: string; sourceId: string; targetId: string; type: string; weight: number }[] = [];

    // Structural edges: NEXT
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({ bookId, sourceId: nodes[i].id, targetId: nodes[i + 1].id, type: 'NEXT', weight: 1.0 });
    }

    // Similarity edges: SIMILAR (placeholder until pgvector cosine query is wired)
    // TODO: replace with actual vector similarity search
    const vectors = await this.embeddingRepo.findByBookId(bookId);
    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const sim = this.cosineSimilarity(
          new Float32Array(vectors[i].vector.buffer),
          new Float32Array(vectors[j].vector.buffer)
        );
        if (sim > 0.8) {
          edges.push({ bookId, sourceId: nodes[i].id, targetId: nodes[j].id, type: 'SIMILAR', weight: sim });
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
