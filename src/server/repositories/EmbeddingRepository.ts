import { PrismaClient, Embedding } from '@prisma/client';
import { Prisma } from '@prisma/client';

export interface EmbeddingWithChunk {
  id: string;
  chunkId: string;
  vector: Float32Array;
  provider: string;
  createdAt: Date;
  chunk: { content: string } | null;
}

export class EmbeddingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { chunkId: string; vector: Float32Array; provider?: string }): Promise<void> {
    const vectorStr = `[${Array.from(data.vector).join(',')}]`;
    await this.prisma.$queryRawUnsafe(
      `INSERT INTO "Embedding" ("id", "chunkId", "vector", "provider") VALUES (gen_random_uuid(), $1, $2::vector, $3)`,
      data.chunkId,
      vectorStr,
      data.provider || 'openai'
    );
  }

  async batchCreate(items: { chunkId: string; vector: Float32Array; provider?: string }[]): Promise<void> {
    if (items.length === 0) return;
    // Build multi-row INSERT
    const values: string[] = [];
    const params: string[] = [];
    for (const item of items) {
      const vectorStr = `[${Array.from(item.vector).join(',')}]`;
      params.push(item.chunkId, vectorStr, item.provider || 'openai');
      const base = params.length - 3;
      values.push(`(gen_random_uuid(), $${base + 1}, $${base + 2}::vector, $${base + 3})`);
    }
    await this.prisma.$queryRawUnsafe(
      `INSERT INTO "Embedding" ("id", "chunkId", "vector", "provider") VALUES ${values.join(', ')}`,
      ...params
    );
  }

  async findBySessionId(sessionId: string): Promise<EmbeddingWithChunk[]> {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT e."id", e."chunkId", e."vector"::text as "vectorStr", e."provider", e."createdAt", c."content"
       FROM "Embedding" e
       JOIN "SessionChunk" c ON e."chunkId" = c."id"
       WHERE c."sessionId" = $1`,
      sessionId
    );
    return rows.map(this.mapRow);
  }

  async findNearest(sessionId: string, vector: Float32Array, limit: number = 5): Promise<EmbeddingWithChunk[]> {
    const vectorStr = `[${Array.from(vector).join(',')}]`;
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT e."id", e."chunkId", e."vector"::text as "vectorStr", e."provider", e."createdAt", c."content"
       FROM "Embedding" e
       JOIN "SessionChunk" c ON e."chunkId" = c."id"
       WHERE c."sessionId" = $1
       ORDER BY e."vector" <=> $2::vector
       LIMIT $3`,
      sessionId,
      vectorStr,
      limit
    );
    return rows.map(this.mapRow);
  }

  async findNearestInSession(sessionId: string, vector: Float32Array, limit: number = 5): Promise<{ chunkId: string; content: string; similarity: number }[]> {
    const vectorStr = `[${Array.from(vector).join(',')}]`;
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT e."chunkId", c."content", 1 - (e."vector" <=> $2::vector) as "similarity"
       FROM "Embedding" e
       JOIN "SessionChunk" c ON e."chunkId" = c."id"
       WHERE c."sessionId" = $1
       ORDER BY e."vector" <=> $2::vector
       LIMIT $3`,
      sessionId,
      vectorStr,
      limit
    );
    return rows.map((r: any) => ({
      chunkId: r.chunkId,
      content: r.content,
      similarity: Number(r.similarity),
    }));
  }

  private mapRow(row: any): EmbeddingWithChunk {
    // Parse vector string like "[0.1,0.2,...]" to Float32Array
    const vectorStr: string = row.vectorStr || '[]';
    const arr = vectorStr
      .replace(/[\[\]]/g, '')
      .split(',')
      .filter(s => s.trim())
      .map(Number);
    return {
      id: row.id,
      chunkId: row.chunkId,
      vector: new Float32Array(arr),
      provider: row.provider,
      createdAt: new Date(row.createdAt),
      chunk: row.content ? { content: row.content } : null,
    };
  }
}
