import { PrismaClient, GraphNode } from '@prisma/client';

export class GraphNodeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { sessionId: string; chunkId?: string; type: string; label: string }): Promise<GraphNode> {
    return this.prisma.graphNode.create({ data: data as any });
  }

  async createMany(nodes: { sessionId: string; chunkId?: string; type: string; label: string }[]): Promise<GraphNode[]> {
    const created = [];
    for (const n of nodes) {
      created.push(await this.prisma.graphNode.create({ data: n as any }));
    }
    return created;
  }

  async findBySessionId(sessionId: string): Promise<GraphNode[]> {
    return this.prisma.graphNode.findMany({ where: { sessionId } });
  }

  async findByIdWithNeighbors(id: string): Promise<GraphNode & { outgoing: (GraphNode & { target: GraphNode })[]; incoming: (GraphNode & { source: GraphNode })[]; chunk: { content: string } | null }> {
    const node = await this.prisma.graphNode.findUnique({
      where: { id },
      include: {
        outgoing: { include: { target: true } },
        incoming: { include: { source: true } },
        chunk: { select: { content: true } },
      },
    });
    if (!node) throw new Error('Node not found');
    return node as any;
  }
}
