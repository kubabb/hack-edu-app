import { PrismaClient, GraphEdge, Prisma } from '@prisma/client';

export class GraphEdgeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { sessionId: string; sourceId: string; targetId: string; type: string; weight?: number }): Promise<GraphEdge> {
    return this.prisma.graphEdge.create({
      data: data as Prisma.GraphEdgeUncheckedCreateInput,
    });
  }

  async createMany(edges: { sessionId: string; sourceId: string; targetId: string; type: string; weight?: number }[]): Promise<GraphEdge[]> {
    const created: GraphEdge[] = [];
    for (const e of edges) {
      created.push(await this.prisma.graphEdge.create({
        data: e as Prisma.GraphEdgeUncheckedCreateInput,
      }));
    }
    return created;
  }

  async findBySessionId(sessionId: string): Promise<GraphEdge[]> {
    return this.prisma.graphEdge.findMany({ where: { sessionId } });
  }

  async findBySourceId(sourceId: string): Promise<GraphEdge[]> {
    return this.prisma.graphEdge.findMany({ where: { sourceId } });
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    await this.prisma.graphEdge.deleteMany({ where: { sessionId } });
  }
}
