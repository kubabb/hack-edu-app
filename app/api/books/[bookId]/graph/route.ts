import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '@/src/server/repositories/GraphEdgeRepository';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { GraphBuilderService } from '@/src/server/services/GraphBuilderService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookId } = await params;
  const url = new URL(req.url);
  const types = url.searchParams.get('types')?.split(',').filter(Boolean);
  const highlightNodeId = url.searchParams.get('highlight');
  const exportFormat = url.searchParams.get('export');

  const nodeRepo = new GraphNodeRepository(prisma);
  const edgeRepo = new GraphEdgeRepository(prisma);
  const chunkRepo = new SessionChunkRepository(prisma);
  const embeddingRepo = new EmbeddingRepository(prisma);
  const graphBuilder = new GraphBuilderService(nodeRepo, edgeRepo, chunkRepo, embeddingRepo);

  // bookId is actually sessionId (legacy naming)
  const sessionId = bookId;

  const existingNodes = await nodeRepo.findBySessionId(sessionId);
  if (existingNodes.length === 0) {
    await graphBuilder.buildGraph(sessionId);
  }

  const [nodes, edges] = await Promise.all([
    nodeRepo.findBySessionId(sessionId, types),
    edgeRepo.findBySessionId(sessionId),
  ]);

  // If highlighting a node, find its path and mark nodes
  let highlightedNodeIds: string[] = [];
  if (highlightNodeId) {
    highlightedNodeIds = await nodeRepo.findReachableNodes(highlightNodeId, ['DEPENDS_ON', 'NEXT'], 3);
  }

  // Export formats
  if (exportFormat === 'json') {
    return new NextResponse(JSON.stringify({ nodes, edges }), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="graph-${sessionId}.json"`,
      },
    });
  }

  return NextResponse.json({
    nodes: nodes.map(n => ({
      id: n.id,
      label: n.label,
      type: n.type,
      highlighted: highlightedNodeIds.includes(n.id),
    })),
    edges: edges.map(e => ({
      source: e.sourceId,
      target: e.targetId,
      type: e.type,
      weight: e.weight,
      highlighted: highlightedNodeIds.includes(e.sourceId) || highlightedNodeIds.includes(e.targetId),
    })),
    highlightedNodeIds,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await params;
  const body = await req.json();
  const { nodeId } = body;

  if (!nodeId) return NextResponse.json({ error: 'nodeId required' }, { status: 400 });

  const nodeRepo = new GraphNodeRepository(prisma);
  const highlightedNodeIds = await nodeRepo.findReachableNodes(nodeId, ['DEPENDS_ON', 'NEXT'], 3);

  return NextResponse.json({ highlightedNodeIds });
}
