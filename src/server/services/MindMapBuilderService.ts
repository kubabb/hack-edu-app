import { PrismaClient } from '@prisma/client';
import { SessionChunkRepository } from '../repositories/SessionChunkRepository';

export interface MindMapTreeNode {
  id: string;
  label: string;
  type: string;
  chunkId?: string;
  children: MindMapTreeNode[];
}

export class MindMapBuilderService {
  constructor(
    private prisma: PrismaClient,
    private chunkRepo: SessionChunkRepository
  ) {}

  /** Build a mind map tree from session chunks */
  async buildTree(sessionId: string): Promise<MindMapTreeNode> {
    // Check if already built
    const existing = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "label", "type", "parentId", "chunkId", "position"
       FROM "MindMapNode"
       WHERE "sessionId" = $1
       ORDER BY "position" ASC`,
      sessionId
    );

    if (existing.length > 0) {
      return this.rowsToTree(existing);
    }

    // Build from chunks
    const chunks = await this.chunkRepo.findBySessionId(sessionId);
    const session = await this.prisma.learningSession.findUnique({
      where: { id: sessionId },
      select: { topic: true },
    });

    const rootLabel = session?.topic || 'Sesja';
    const rootId = `root_${sessionId}`;

    // Detect hierarchy from chunk content (headers like "Rozdział 1", "1.1 Wprowadzenie")
    const nodes: Array<{
      id: string;
      label: string;
      type: string;
      parentId: string | null;
      chunkId?: string;
      position: number;
    }> = [];

    // Root node
    nodes.push({ id: rootId, label: rootLabel, type: 'root', parentId: null, position: 0 });

    let currentChapterId: string | null = null;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const nodeId = `node_${sessionId}_${i}`;

      // Detect headers by common patterns
      const headerMatch = chunk.content.match(
        /^(Rozdział\s+\d+|Część\s+\d+|Dział\s+\d+|[0-9]+\.[0-9]*\.?\s+[A-ZĄĆĘŁŃÓŚŹŻ].{3,}|Temat\s*:?\s*.{3,})/
      );

      let nodeType: string = chunk.type || 'OTHER';
      let label = chunk.content.substring(0, 80).replace(/\n/g, ' ').trim();
      let parentId: string = rootId;

      if (headerMatch) {
        nodeType = 'CHAPTER';
        label = headerMatch[1].trim();
        parentId = rootId;
        currentChapterId = nodeId;
      } else if (chunk.type === 'TASK' || chunk.type === 'EXAMPLE') {
        nodeType = 'TASK';
        // Extract task number if present
        const taskMatch = chunk.content.match(/^(Zadanie\s+\d+|Przykład\s+\d+)/i);
        if (taskMatch) label = taskMatch[1].trim();
        parentId = currentChapterId || rootId;
      } else if (chunk.type === 'THEORY') {
        nodeType = 'CONCEPT';
        parentId = currentChapterId || rootId;
      } else {
        nodeType = 'SECTION';
        parentId = currentChapterId || rootId;
      }

      nodes.push({
        id: nodeId,
        label: label.substring(0, 200),
        type: nodeType,
        parentId,
        chunkId: chunk.id,
        position: i + 1,
      });
    }

    // Persist to DB
    await this.persistNodes(sessionId, nodes);

    return this.rowsToTree(nodes);
  }

  /** Persist mind map nodes to database */
  private async persistNodes(
    sessionId: string,
    nodes: Array<{ id: string; label: string; type: string; parentId: string | null; chunkId?: string; position: number }>
  ) {
    // Delete existing nodes for this session
    await this.prisma.$queryRawUnsafe(
      `DELETE FROM "MindMapNode" WHERE "sessionId" = $1`,
      sessionId
    );

    if (nodes.length === 0) return;

    // Batch insert
    const values: string[] = [];
    const params: any[] = [];
    for (const node of nodes) {
      params.push(node.id, sessionId, node.label, node.type, node.parentId, node.chunkId || null, node.position);
      const base = params.length - 7;
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`);
    }

    await this.prisma.$queryRawUnsafe(
      `INSERT INTO "MindMapNode" ("id", "sessionId", "label", "type", "parentId", "chunkId", "position")
       VALUES ${values.join(', ')}`,
      ...params
    );
  }

  /** Convert flat rows to tree structure */
  private rowsToTree(
    rows: Array<{ id: string; label: string; type: string; parentId: string | null; chunkId?: string; position: number }>
  ): MindMapTreeNode {
    const nodeMap = new Map<string, MindMapTreeNode>();
    let root: MindMapTreeNode | null = null;

    for (const row of rows) {
      const node: MindMapTreeNode = {
        id: row.id,
        label: row.label,
        type: row.type,
        chunkId: row.chunkId,
        children: [],
      };
      nodeMap.set(row.id, node);
    }

    for (const row of rows) {
      const node = nodeMap.get(row.id)!;
      if (row.parentId && nodeMap.has(row.parentId)) {
        nodeMap.get(row.parentId)!.children.push(node);
      } else if (!row.parentId) {
        root = node;
      }
    }

    return root || {
      id: 'empty',
      label: 'Brak danych',
      type: 'root',
      children: [],
    };
  }
}
