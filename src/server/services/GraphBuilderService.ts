import { GraphNodeRepository } from '../repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '../repositories/GraphEdgeRepository';
import { SessionChunkRepository } from '../repositories/SessionChunkRepository';
import { EmbeddingRepository } from '../repositories/EmbeddingRepository';
import { createOpenAIClient, resolveModel } from '../lib/openai-client';

type PersistedNodeType = 'CONCEPT' | 'TASK' | 'SECTION'
type PersistedEdgeType = 'SIMILAR' | 'DEPENDS_ON' | 'NEXT' | 'PART_OF'

type SessionChunkLike = {
  id: string
  type: string
  content: string
}

type AIGraphNode = {
  id: string
  label: string
  type?: string
}

type AIGraphEdge = {
  source: string
  target: string
  type?: string
  weight?: number
}

type AIGraphPayload = {
  nodes?: AIGraphNode[]
  edges?: AIGraphEdge[]
}

export class GraphBuilderService {
  constructor(
    private nodeRepo: GraphNodeRepository,
    private edgeRepo: GraphEdgeRepository,
    private chunkRepo: SessionChunkRepository,
    private embeddingRepo: EmbeddingRepository
  ) {}

  async buildGraph(sessionId: string, options?: { force?: boolean }) {
    const chunks = await this.chunkRepo.findBySessionId(sessionId);
    if (chunks.length === 0) return;

    const existingNodes = await this.nodeRepo.findBySessionId(sessionId);
    if (existingNodes.length > 0 && !options?.force) return;

    await this.edgeRepo.deleteBySessionId(sessionId);
    await this.nodeRepo.deleteBySessionId(sessionId);

    const aiGraph = await this.tryGenerateAIGraph(chunks);
    if (aiGraph) {
      await this.persistAIGraph(sessionId, chunks, aiGraph);
      return;
    }

    await this.persistHeuristicGraph(sessionId, chunks);
  }

  private async persistHeuristicGraph(sessionId: string, chunks: SessionChunkLike[]) {
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

  private async tryGenerateAIGraph(chunks: SessionChunkLike[]): Promise<AIGraphPayload | null> {
    try {
      const fullText = chunks
        .map((chunk, index) => `[Fragment ${index + 1}]\n${chunk.content}`)
        .join('\n\n---\n\n')
        .slice(0, 18000);

      const systemPrompt = `Jestes ekspertem od budowy grafow wiedzy dla materialow edukacyjnych.
Zwracasz TYLKO poprawny JSON w formacie:
{
  "nodes": [
    { "id": "n1", "label": "Pojecie", "type": "CONCEPT" }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "type": "DEPENDS_ON", "weight": 0.9 }
  ]
}

ZASADY:
- Stworz 12-22 wezlow.
- Pokaz najwazniejsze pojecia, sekcje i zadania z materialu.
- Uzywaj tylko typow wezlow: CONCEPT, TASK, SECTION.
- Uzywaj tylko typow krawedzi: DEPENDS_ON, PART_OF, SIMILAR, NEXT.
- Krawedzie maja reprezentowac prawdziwe relacje merytoryczne, nie przypadkowe sasiedztwo.
- Label ma byc krotki, konkretny i czytelny.
- Nie dodawaj komentarzy, markdown ani dodatkowego tekstu.`;

      const openai = createOpenAIClient(process.env.OPENAI_API_KEY || '');
      const completion = await openai.chat.completions.create({
        model: resolveModel('gpt-4o-mini', process.env.OPENAI_API_KEY || ''),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Zbuduj graf wiedzy z tego materialu:\n\n${fullText}` },
        ],
        temperature: 0.2,
        max_completion_tokens: 3200,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return null;

      let parsed: AIGraphPayload | null = null;
      try {
        parsed = JSON.parse(content) as AIGraphPayload;
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match?.[0]) {
          parsed = JSON.parse(match[0]) as AIGraphPayload;
        }
      }

      if (!parsed?.nodes?.length) return null;
      return parsed;
    } catch (error) {
      console.warn('AI graph generation failed, falling back to heuristic graph.', error);
      return null;
    }
  }

  private async persistAIGraph(sessionId: string, chunks: SessionChunkLike[], graph: AIGraphPayload) {
    const normalizedNodes = (graph.nodes || [])
      .map((node, index) => ({
        tempId: node.id || `n${index + 1}`,
        label: (node.label || '').trim().slice(0, 120),
        type: this.normalizeNodeType(node.type),
      }))
      .filter((node, index, array) => node.label && array.findIndex((item) => item.label === node.label) === index)
      .slice(0, 24);

    if (normalizedNodes.length === 0) {
      await this.persistHeuristicGraph(sessionId, chunks);
      return;
    }

    const createdNodes = await this.nodeRepo.createMany(
      normalizedNodes.map((node) => ({
        sessionId,
        chunkId: this.findBestChunkIdForLabel(chunks, node.label),
        type: node.type,
        label: node.label,
      })),
    );

    const idMap = new Map<string, string>();
    normalizedNodes.forEach((node, index) => {
      idMap.set(node.tempId, createdNodes[index].id);
    });

    const normalizedEdges = (graph.edges || [])
      .map((edge) => {
        const sourceId = idMap.get(edge.source);
        const targetId = idMap.get(edge.target);
        if (!sourceId || !targetId || sourceId === targetId) return null;

        return {
          sessionId,
          sourceId,
          targetId,
          type: this.normalizeEdgeType(edge.type),
          weight: this.normalizeWeight(edge.weight),
        };
      })
      .filter((edge): edge is { sessionId: string; sourceId: string; targetId: string; type: PersistedEdgeType; weight: number } => Boolean(edge))
      .filter((edge, index, array) => {
        const edgeKey = `${edge.sourceId}:${edge.targetId}:${edge.type}`;
        return array.findIndex((candidate) => `${candidate.sourceId}:${candidate.targetId}:${candidate.type}` === edgeKey) === index;
      });

    const fallbackEdges =
      normalizedEdges.length > 0
        ? normalizedEdges
        : createdNodes.slice(0, -1).map((node, index) => ({
            sessionId,
            sourceId: node.id,
            targetId: createdNodes[index + 1].id,
            type: 'NEXT' as PersistedEdgeType,
            weight: 0.7,
          }));

    if (fallbackEdges.length > 0) {
      await this.edgeRepo.createMany(fallbackEdges);
    }
  }

  private normalizeNodeType(value?: string): PersistedNodeType {
    if (value === 'TASK') return 'TASK';
    if (value === 'SECTION') return 'SECTION';
    return 'CONCEPT';
  }

  private normalizeEdgeType(value?: string): PersistedEdgeType {
    if (value === 'DEPENDS_ON') return 'DEPENDS_ON';
    if (value === 'PART_OF') return 'PART_OF';
    if (value === 'NEXT') return 'NEXT';
    return 'SIMILAR';
  }

  private normalizeWeight(value?: number) {
    if (typeof value !== 'number' || Number.isNaN(value)) return 0.8;
    return Math.max(0.1, Math.min(1, value));
  }

  private inferNodeType(chunkType: string): PersistedNodeType {
    switch (chunkType) {
      case 'TASK': return 'TASK';
      case 'THEORY': return 'CONCEPT';
      case 'EXAMPLE': return 'SECTION';
      default: return 'CONCEPT';
    }
  }

  private findBestChunkIdForLabel(chunks: SessionChunkLike[], label: string) {
    const normalizedLabel = this.tokenize(label);
    if (normalizedLabel.length === 0) return chunks[0]?.id;

    let bestChunkId = chunks[0]?.id;
    let bestScore = -1;

    for (const chunk of chunks) {
      const chunkTokens = this.tokenize(chunk.content.slice(0, 700));
      const overlap = normalizedLabel.filter((token) => chunkTokens.includes(token)).length;
      const includesWholeLabel = chunk.content.toLowerCase().includes(label.toLowerCase()) ? 3 : 0;
      const score = overlap + includesWholeLabel;

      if (score > bestScore) {
        bestScore = score;
        bestChunkId = chunk.id;
      }
    }

    return bestChunkId;
  }

  private tokenize(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9ąćęłńóśźż\s]/gi, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2);
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
