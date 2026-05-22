import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '@/src/server/repositories/GraphEdgeRepository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookId } = await params;
  const nodeRepo = new GraphNodeRepository(prisma);
  const edgeRepo = new GraphEdgeRepository(prisma);

  const [nodes, edges] = await Promise.all([
    nodeRepo.findByBookId(bookId),
    edgeRepo.findByBookId(bookId),
  ]);

  return NextResponse.json({ nodes, edges });
}
