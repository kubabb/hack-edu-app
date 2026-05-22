import { PrismaClient, LearningSession, SessionStatus } from '@prisma/client';

export class LearningSessionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { userId: string; topic: string; status?: SessionStatus }): Promise<LearningSession> {
    return this.prisma.learningSession.create({ data });
  }

  async findById(id: string): Promise<LearningSession | null> {
    return this.prisma.learningSession.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<LearningSession[]> {
    return this.prisma.learningSession.findMany({ 
      where: { userId }, 
      include: {
        _count: {
          select: { chunks: true, messages: true }
        }
      },
      orderBy: { createdAt: 'desc' } 
    });
  }

  async updateStatus(id: string, status: SessionStatus): Promise<LearningSession> {
    return this.prisma.learningSession.update({ where: { id }, data: { status } });
  }
}
