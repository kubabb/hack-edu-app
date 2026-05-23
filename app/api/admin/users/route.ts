import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { learningSessions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}
