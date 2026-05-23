import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { MindMapBuilderService } from '@/src/server/services/MindMapBuilderService';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const chunkRepo = new SessionChunkRepository(prisma);
    const mindMapService = new MindMapBuilderService(prisma, chunkRepo);
    const tree = await mindMapService.buildTree(id);

    return NextResponse.json(tree);

  } catch (error: any) {
    console.error('Error building mind map:', error);
    return NextResponse.json({ error: 'Failed to build mind map' }, { status: 500 });
  }
}
