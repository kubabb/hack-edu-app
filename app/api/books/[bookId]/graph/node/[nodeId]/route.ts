import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bookId: string; nodeId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookId, nodeId } = await params;
    const nodeRepo = new GraphNodeRepository(prisma);
    const node = await nodeRepo.findByIdWithNeighbors(nodeId);

    if (node.sessionId !== bookId) {
      return NextResponse.json({ error: 'Nie znaleziono węzła w tym materiale.' }, { status: 404 });
    }

    return NextResponse.json({
      node: {
        id: node.id,
        label: node.label,
        type: node.type,
        content: node.chunk?.content || '',
        related: [
          ...node.outgoing.map((edge) => ({
            id: edge.target.id,
            label: edge.target.label,
            relation: edge.type,
            direction: 'outgoing' as const,
          })),
          ...node.incoming.map((edge) => ({
            id: edge.source.id,
            label: edge.source.label,
            relation: edge.type,
            direction: 'incoming' as const,
          })),
        ].slice(0, 12),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nie udało się pobrać szczegółów węzła.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
