import { PrismaClient, GraphNode, Prisma } from '@prisma/client';

type GraphNodeWithNeighbors = Prisma.GraphNodeGetPayload<{
  include: {
    outgoing: { include: { target: true } }
    incoming: { include: { source: true } }
    chunk: { select: { content: true } }
  }
}>

export class GraphNodeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: { sessionId: string; chunkId?: string; type: string; label: string }): Promise<GraphNode> {
    return this.prisma.graphNode.create({
      data: data as Prisma.GraphNodeUncheckedCreateInput,
    });
  }

  async createMany(nodes: { sessionId: string; chunkId?: string; type: string; label: string }[]): Promise<GraphNode[]> {
    const created: GraphNode[] = [];
    for (const n of nodes) {
      created.push(await this.prisma.graphNode.create({
        data: n as Prisma.GraphNodeUncheckedCreateInput,
      }));
    }
    return created;
  }

  async findBySessionId(sessionId: string, types?: string[]): Promise<GraphNode[]> {
    const where: Prisma.GraphNodeWhereInput = { sessionId };
    if (types && types.length > 0) {
      where.type = { in: types };
    }
    return this.prisma.graphNode.findMany({ where });
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    await this.prisma.graphNode.deleteMany({ where: { sessionId } });
  }

  async findByIdWithNeighbors(id: string): Promise<GraphNodeWithNeighbors> {
    const node = await this.prisma.graphNode.findUnique({
      where: { id },
      include: {
        outgoing: { include: { target: true } },
        incoming: { include: { source: true } },
        chunk: { select: { content: true } },
      },
    });
    if (!node) throw new Error('Node not found');
    return node;
  }

  /** Find all nodes reachable from a node via edge types (BFS, limited depth) */
  async findReachableNodes(nodeId: string, edgeTypes: string[] = ['DEPENDS_ON', 'NEXT'], maxDepth: number = 3): Promise<string[]> {
    const visited = new Set<string>();
    const result: string[] = [];
    let frontier = [nodeId];
    visited.add(nodeId);

    for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
      const nextFrontier: string[] = [];
      const frontierStr = frontier.map(id => `'${id}'`).join(',');

      if (!frontierStr) break;

      // Find outgoing edges
      const outgoing = await this.prisma.$queryRawUnsafe<Array<{ targetId: string }>>(
        `SELECT "targetId" FROM "GraphEdge" WHERE "sourceId" IN (${frontierStr}) AND "type" = ANY($1)`,
        edgeTypes
      );

      for (const row of outgoing) {
        if (!visited.has(row.targetId)) {
          visited.add(row.targetId);
          result.push(row.targetId);
          nextFrontier.push(row.targetId);
        }
      }

      // Find incoming edges
      const incoming = await this.prisma.$queryRawUnsafe<Array<{ sourceId: string }>>(
        `SELECT "sourceId" FROM "GraphEdge" WHERE "targetId" IN (${frontierStr}) AND "type" = ANY($1)`,
        edgeTypes
      );

      for (const row of incoming) {
        if (!visited.has(row.sourceId)) {
          visited.add(row.sourceId);
          result.push(row.sourceId);
          nextFrontier.push(row.sourceId);
        }
      }

      frontier = nextFrontier;
    }

    return result;
  }
}
