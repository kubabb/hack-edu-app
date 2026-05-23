import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { HeyGenAvatarAdapter } from '@/src/server/adapters/HeyGenAvatarAdapter';
import { prisma } from '@/src/server/prisma';

function buildTutorContextPrompt(topic: string, summary: string | null, chunkTexts: string[]) {
  const chunksBlock = chunkTexts
    .filter(Boolean)
    .join('\n\n---\n\n')
    .slice(0, 14000);

  const summaryBlock = summary?.trim()
    ? `PODSUMOWANIE / NOTATKI:\n${summary.trim().slice(0, 5000)}\n\n`
    : '';

  return `Jesteś polskim korepetytorem AI prowadzącym rozmowę na bazie materiału ucznia.

TEMAT SESJI:
${topic}

${summaryBlock}MATERIAŁ ŹRÓDŁOWY:
${chunksBlock || 'Brak dodatkowych fragmentów materiału.'}

ZASADY:
1. Odpowiadaj po polsku.
2. Bazuj wyłącznie na podanym materiale i transkrypcji.
3. Gdy uczeń pyta o materiał, odwołuj się do treści z materiału zamiast odpowiadać ogólnie.
4. Jeśli materiał nie zawiera odpowiedzi, powiedz wyraźnie, że nie ma tej informacji w materiałach.
5. Tłumacz prosto, krok po kroku, jak korepetytor.
6. Nie mów, że nie masz dostępu do materiału, bo właśnie go otrzymałeś.`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const requestedSessionId =
      typeof body?.sessionId === 'string' && body.sessionId.trim() ? body.sessionId.trim() : null;

    const heygenKey = process.env.HEYGEN_API_KEY;
    if (!heygenKey) {
      return NextResponse.json({ error: 'Brak klucza API HeyGen w zmiennych środowiskowych serwera. Zrestartuj serwer.' }, { status: 500 });
    }

    const adapter = new HeyGenAvatarAdapter(heygenKey);
    let sessionData;

    if (requestedSessionId) {
      const learningSession = await prisma.learningSession.findFirst({
        where: {
          id: requestedSessionId,
          userId: (session.user as { id?: string }).id,
        },
        select: {
          id: true,
          topic: true,
          summary: true,
          chunks: {
            select: { content: true },
            orderBy: { position: 'asc' },
            take: 16,
          },
        },
      });

      if (!learningSession) {
        return NextResponse.json({ error: 'Nie znaleziono sesji do uruchomienia tutora.' }, { status: 404 });
      }

      const prompt = buildTutorContextPrompt(
        learningSession.topic,
        learningSession.summary,
        learningSession.chunks.map((chunk) => chunk.content),
      );

      sessionData = await adapter.createSession(
        '9650a758-1085-4d49-8bf3-f347565ec229',
        undefined,
        {
          name: `TutorAI Session ${learningSession.id}`,
          prompt,
          openingText: `Cześć! Mam już kontekst do materiału "${learningSession.topic}". O co chcesz mnie zapytać?`,
        },
      );
    } else {
      sessionData = await adapter.createSession('9650a758-1085-4d49-8bf3-f347565ec229');
    }

    return NextResponse.json({ 
      sessionToken: sessionData.sessionToken
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error generating HeyGen token:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
