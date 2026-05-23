import { PrismaClient } from '@prisma/client';
import { SessionChunkRepository } from '../repositories/SessionChunkRepository';
import { createOpenAIClient, resolveModel } from '../lib/openai-client';

export interface MindMapTreeNode {
  id: string;
  label: string;
  type: string;
  chunkId?: string;
  children: MindMapTreeNode[];
}

type SessionChunkLike = {
  id: string
  type: string
  content: string
}

type AIMindMapNode = {
  label?: string
  type?: string
  children?: AIMindMapNode[]
}

type MindMapRow = {
  id: string
  label: string
  type: string
  parentId: string | null
  chunkId?: string
  position: number
}

export class MindMapBuilderService {
  constructor(
    private prisma: PrismaClient,
    private chunkRepo: SessionChunkRepository
  ) {}

  /** Build a mind map tree from session chunks */
  async buildTree(sessionId: string, options?: { force?: boolean }): Promise<MindMapTreeNode> {
    // Check if already built
    const existing = await this.prisma.$queryRawUnsafe<MindMapRow[]>(
      `SELECT "id", "label", "type", "parentId", "chunkId", "position"
       FROM "MindMapNode"
       WHERE "sessionId" = $1
       ORDER BY "position" ASC`,
      sessionId
    );

    if (existing.length > 0 && !options?.force) {
      return this.rowsToTree(existing);
    }

    // Build from chunks
    const chunks = await this.chunkRepo.findBySessionId(sessionId);
    const session = await this.prisma.learningSession.findUnique({
      where: { id: sessionId },
      select: { topic: true },
    });

    const rootLabel = session?.topic || 'Sesja';
    const aiTree = await this.tryGenerateAITree(rootLabel, chunks);
    if (aiTree) {
      const aiNodes = this.flattenAITree(sessionId, aiTree, chunks);
      await this.persistNodes(sessionId, aiNodes);
      return this.rowsToTree(aiNodes);
    }

    const rootId = `root_${sessionId}`;

    // Detect hierarchy from chunk content (headers like "Rozdział 1", "1.1 Wprowadzenie")
    const nodes: MindMapRow[] = [];

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

  private async tryGenerateAITree(topic: string, chunks: SessionChunkLike[]): Promise<AIMindMapNode | null> {
    try {
      const fullText = chunks
        .map((chunk, index) => `[Fragment ${index + 1}]\n${chunk.content}`)
        .join('\n\n---\n\n')
        .slice(0, 18000);

      const systemPrompt = `Jestes ekspertem od tworzenia map mysli dla materialow edukacyjnych.
Zwracasz TYLKO JSON w formacie:
{
  "label": "Temat glowny",
  "type": "root",
  "children": [
    {
      "label": "Glowny temat",
      "type": "CHAPTER",
      "children": [
        { "label": "Podtemat", "type": "SECTION", "children": [] }
      ]
    }
  ]
}

ZASADY:
- Utworz 4-7 glownych galezi.
- Rozwin kazda galaz o 2-5 sensownych podtematow.
- Maksymalnie 4 poziomy glebokosci liczac root.
- Uzywaj tylko typow: root, CHAPTER, SECTION, CONCEPT, TASK.
- Etykiety maja byc krotkie i merytoryczne.
- Odpowiadasz wylacznie JSON-em.`;

      const openai = createOpenAIClient(process.env.OPENAI_API_KEY || '');
      const completion = await openai.chat.completions.create({
        model: resolveModel('gpt-4o-mini', process.env.OPENAI_API_KEY || ''),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Zbuduj mape mysli dla tematu "${topic}" na podstawie tego materialu:\n\n${fullText}` },
        ],
        temperature: 0.25,
        max_completion_tokens: 3200,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return null;

      let parsed: AIMindMapNode | null = null;
      try {
        parsed = JSON.parse(content) as AIMindMapNode;
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match?.[0]) {
          parsed = JSON.parse(match[0]) as AIMindMapNode;
        }
      }

      if (!parsed?.label) return null;
      return parsed;
    } catch (error) {
      console.warn('AI mind map generation failed, falling back to heuristic tree.', error);
      return null;
    }
  }

  private flattenAITree(sessionId: string, tree: AIMindMapNode, chunks: SessionChunkLike[]) {
    const rows: MindMapRow[] = [];

    let position = 0;

    const visit = (node: AIMindMapNode, parentId: string | null, depth: number) => {
      const label = (node.label || '').trim().slice(0, 200);
      if (!label) return;

      const nodeId = `${sessionId}_mind_${position}`;
      const type = this.normalizeMindMapType(node.type, depth);

      rows.push({
        id: nodeId,
        label,
        type,
        parentId,
        chunkId: depth === 0 ? undefined : this.findBestChunkIdForLabel(chunks, label),
        position: position++,
      });

      const children = Array.isArray(node.children) ? node.children.slice(0, depth === 0 ? 7 : 5) : [];
      for (const child of children) {
        visit(child, nodeId, depth + 1);
      }
    };

    visit(tree, null, 0);
    return rows;
  }

  private normalizeMindMapType(value: string | undefined, depth: number) {
    if (depth === 0) return 'root';
    if (value === 'TASK') return 'TASK';
    if (value === 'CONCEPT') return 'CONCEPT';
    if (value === 'SECTION') return 'SECTION';
    if (value === 'CHAPTER') return 'CHAPTER';
    return depth === 1 ? 'CHAPTER' : depth === 2 ? 'SECTION' : 'CONCEPT';
  }

  private findBestChunkIdForLabel(chunks: SessionChunkLike[], label: string) {
    const labelTokens = this.tokenize(label);
    if (labelTokens.length === 0) return chunks[0]?.id;

    let bestChunkId = chunks[0]?.id;
    let bestScore = -1;

    for (const chunk of chunks) {
      const chunkTokens = this.tokenize(chunk.content.slice(0, 700));
      const overlap = labelTokens.filter((token) => chunkTokens.includes(token)).length;
      const includesWholeLabel = chunk.content.toLowerCase().includes(label.toLowerCase()) ? 3 : 0;
      const score = overlap + includesWholeLabel;

      if (score > bestScore) {
        bestScore = score;
        bestChunkId = chunk.id;
      }
    }

    return bestChunkId;
  }

  private tokenize(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9ąćęłńóśźż\s]/gi, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2);
  }

  /** Persist mind map nodes to database */
  private async persistNodes(
    sessionId: string,
    nodes: MindMapRow[]
  ) {
    // Delete existing nodes for this session
    await this.prisma.$queryRawUnsafe(
      `DELETE FROM "MindMapNode" WHERE "sessionId" = $1`,
      sessionId
    );

    if (nodes.length === 0) return;

    // Batch insert
    const values: string[] = [];
    const params: unknown[] = [];
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
  private rowsToTree(rows: MindMapRow[]): MindMapTreeNode {
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
