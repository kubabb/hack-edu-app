import { PrismaClient, GraphEdge } from '@prisma/client';

export class GraphEdgeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { bookId: string; sourceId: string; targetId: string; type: string; weight?: number }): Promise<GraphEdge> {
    return this.prisma.graphEdge.create({ data: data as any });
  }

  async createMany(edges: { bookId: string; sourceId: string; targetId: string; type: string; weight?: number }[]): Promise<GraphEdge[]> {
    const created = [];
    for (const e of edges) {
      created.push(await this.prisma.graphEdge.create({ data: e as any }));
    }
    return created;
  }

  async findByBookId(bookId: string): Promise<GraphEdge[]> {
    return this.prisma.graphEdge.findMany({ where: { bookId } });
  }

  async findBySourceId(sourceId: string): Promise<GraphEdge[]> {
    return this.prisma.graphEdge.findMany({ where: { sourceId } });
  }
}
