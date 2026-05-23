import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }
    const userId = session.user.id;

    // Pobierz wszystkie węzły dla sesji tego użytkownika
    const nodes = await prisma.graphNode.findMany({
      where: {
        session: {
          userId: userId
        }
      },
      select: {
        id: true,
        label: true,
        type: true,
      }
    });

    // Pobierz krawędzie dla sesji tego użytkownika
    const edges = await prisma.graphEdge.findMany({
      where: {
        session: {
          userId: userId
        }
      },
      select: {
        sourceId: true,
        targetId: true,
        type: true,
        weight: true
      }
    });

    // Zwracamy w formacie zgodnym z oczekiwaniami ForceGraph2D
    return NextResponse.json({
      nodes: nodes.map(n => ({ ...n })),
      edges: edges.map(e => ({
        source: e.sourceId,
        target: e.targetId,
        type: e.type,
        weight: e.weight
      }))
    });

  } catch (error: unknown) {
    console.error('Error fetching global graph:', error);
    return NextResponse.json({ error: 'Nie udało się pobrać grafu' }, { status: 500 });
  }
}
