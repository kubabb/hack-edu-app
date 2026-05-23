import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '@/src/server/repositories/GraphEdgeRepository';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { GraphBuilderService } from '@/src/server/services/GraphBuilderService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const chunkRepo = new SessionChunkRepository(prisma);
    const nodeRepo = new GraphNodeRepository(prisma);
    const edgeRepo = new GraphEdgeRepository(prisma);
    const embeddingRepo = new EmbeddingRepository(prisma);
    const graphBuilder = new GraphBuilderService(nodeRepo, edgeRepo, chunkRepo, embeddingRepo);
    const chunks = await chunkRepo.findBySessionId(id);

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Brak materiału. Najpierw wgraj plik.' }, { status: 400 });
    }

    await graphBuilder.buildGraph(id, { force: true });

    const [nodes, edges] = await Promise.all([
      nodeRepo.findBySessionId(id),
      edgeRepo.findBySessionId(id),
    ]);

    return NextResponse.json({
      graph: {
        nodes: nodes.map((node) => ({
          id: node.id,
          label: node.label,
          type: node.type,
        })),
        edges: edges.map((edge) => ({
          source: edge.sourceId,
          target: edge.targetId,
          type: edge.type,
          weight: edge.weight,
        })),
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate graph';
    console.error('Error generating graph:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
