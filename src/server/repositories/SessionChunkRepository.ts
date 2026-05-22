import { PrismaClient, SessionChunk, ChunkType } from '@prisma/client';

export class SessionChunkRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { sessionId: string; type: ChunkType; content: string; position: number }): Promise<SessionChunk> {
    return this.prisma.sessionChunk.create({ data });
  }

  async createMany(chunks: { sessionId: string; type: ChunkType; content: string; position: number }[]): Promise<SessionChunk[]> {
    const created = [];
    for (const c of chunks) {
      created.push(await this.prisma.sessionChunk.create({ data: c }));
    }
    return created;
  }

  async findBySessionId(sessionId: string): Promise<SessionChunk[]> {
    return this.prisma.sessionChunk.findMany({ where: { sessionId }, orderBy: { position: 'asc' } });
  }
}
