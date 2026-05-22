import { PrismaClient, Book, BookStatus } from '@prisma/client';

export class BookRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { userId: string; title: string; status?: BookStatus }): Promise<Book> {
    return this.prisma.book.create({ data });
  }

  async findById(id: string): Promise<Book | null> {
    return this.prisma.book.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Book[]> {
    return this.prisma.book.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async updateStatus(id: string, status: BookStatus): Promise<Book> {
    return this.prisma.book.update({ where: { id }, data: { status } });
  }
}
