import { PrismaClient, ChatMessage, MessageRole } from '@prisma/client';

export class ChatMessageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { sessionId: string; role: MessageRole; content: string }): Promise<ChatMessage> {
    return this.prisma.chatMessage.create({ data });
  }

  async findBySessionId(sessionId: string): Promise<ChatMessage[]> {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<ChatMessage | null> {
    return this.prisma.chatMessage.findUnique({ where: { id } });
  }

  async updateAvatarUrl(id: string, url: string): Promise<ChatMessage> {
    return this.prisma.chatMessage.update({
      where: { id },
      data: { avatarVideoUrl: url },
    });
  }
}
