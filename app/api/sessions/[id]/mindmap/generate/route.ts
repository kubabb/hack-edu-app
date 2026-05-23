import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import { MindMapBuilderService } from '@/src/server/services/MindMapBuilderService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const chunkRepo = new SessionChunkRepository(prisma);
    const mindMapBuilder = new MindMapBuilderService(prisma, chunkRepo);
    const chunks = await chunkRepo.findBySessionId(id);

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Brak materiału. Najpierw wgraj plik.' }, { status: 400 });
    }

    const tree = await mindMapBuilder.buildTree(id, { force: true });

    return NextResponse.json({ tree });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate mind map';
    console.error('Error generating mind map:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
