import { PrismaClient, BookChunk, ChunkType } from '@prisma/client';

export class BookChunkRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { bookId: string; pageId: string; type: ChunkType; content: string; position: number }): Promise<BookChunk> {
    return this.prisma.bookChunk.create({ data });
  }

  async createMany(chunks: { bookId: string; pageId: string; type: ChunkType; content: string; position: number }[]): Promise<BookChunk[]> {
    const created = [];
    for (const c of chunks) {
      created.push(await this.prisma.bookChunk.create({ data: c }));
    }
    return created;
  }

  async findByBookId(bookId: string): Promise<BookChunk[]> {
    return this.prisma.bookChunk.findMany({ where: { bookId }, orderBy: { position: 'asc' } });
  }

  async findByPageId(pageId: string): Promise<BookChunk[]> {
    return this.prisma.bookChunk.findMany({ where: { pageId }, orderBy: { position: 'asc' } });
  }
}
