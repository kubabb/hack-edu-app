import { PrismaClient, ChatSession } from '@prisma/client';

export class ChatSessionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { userId: string; bookId: string }): Promise<ChatSession> {
    return this.prisma.chatSession.create({ data });
  }

  async findById(id: string): Promise<ChatSession | null> {
    return this.prisma.chatSession.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<ChatSession[]> {
    return this.prisma.chatSession.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}
