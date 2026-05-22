import { PrismaClient, Embedding } from '@prisma/client';

export class EmbeddingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { chunkId: string; vector: Uint8Array; provider?: string }): Promise<Embedding> {
    return this.prisma.embedding.create({
      data: {
        chunkId: data.chunkId,
        vector: Buffer.from(data.vector) as any,
        provider: data.provider || 'openai',
      },
    });
  }

  async batchCreate(items: { chunkId: string; vector: Uint8Array; provider?: string }[]): Promise<Embedding[]> {
    const created = [];
    for (const item of items) {
      created.push(await this.create(item));
    }
    return created;
  }

  async findByBookId(bookId: string): Promise<(Embedding & { chunk: { content: string } | null })[]> {
    return this.prisma.embedding.findMany({
      where: { chunk: { bookId } },
      include: { chunk: { select: { content: true } } },
    });
  }

  async findNearest(bookId: string, vector: Uint8Array, limit: number = 5): Promise<(Embedding & { chunk: { content: string } | null })[]> {
    return this.prisma.embedding.findMany({
      where: { chunk: { bookId } },
      include: { chunk: { select: { content: true } } },
      take: limit,
    });
  }
}
