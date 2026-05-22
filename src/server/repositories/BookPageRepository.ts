import { PrismaClient, BookPage } from '@prisma/client';

export class BookPageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { bookId: string; pageNumber: number; rawText: string; ocrMeta?: any }): Promise<BookPage> {
    return this.prisma.bookPage.create({ data });
  }

  async createMany(pages: { bookId: string; pageNumber: number; rawText: string; ocrMeta?: any }[]): Promise<BookPage[]> {
    const created = [];
    for (const p of pages) {
      created.push(await this.prisma.bookPage.create({ data: p }));
    }
    return created;
  }

  async findByBookId(bookId: string): Promise<BookPage[]> {
    return this.prisma.bookPage.findMany({ where: { bookId }, orderBy: { pageNumber: 'asc' } });
  }
}
