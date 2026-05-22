import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import OpenAI from 'openai';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    // Pobierz sesję
    const learningSession = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!learningSession || learningSession.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Sesja nie znaleziona' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const frontendMessages = body.messages || [];

    // Zbuduj historię konwersacji do podsumowania
    let conversationText = '';
    
    if (frontendMessages.length > 0) {
      conversationText = frontendMessages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
      
      // Zapisujemy wiadomości przysłane z LiveAvatara do bazy danych, żeby były w materiałach
      try {
        await prisma.chatMessage.createMany({
          data: frontendMessages.map((m: any) => ({
            sessionId: sessionId,
            role: m.role.toLowerCase() === 'user' ? 'USER' : 'ASSISTANT',
            content: m.content
          }))
        });
      } catch (e) {
        console.error('Failed to save messages', e);
      }
    } else if (learningSession.messages.length > 0) {
      conversationText = learningSession.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    }

    let summaryText = 'Brak wystarczającej interakcji do stworzenia podsumowania.';

    if (conversationText.trim().length > 0) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Jesteś asystentem edukacyjnym. Użytkownik właśnie zakończył interaktywną lekcję z wirtualnym korepetytorem. Twoim zadaniem jest stworzyć krótkie, rzeczowe i zachęcające podsumowanie (notatkę) z tej lekcji na podstawie historii czatu. Wypisz główne pojęcia, które były omawiane. Formatuj w Markdown, użyj punktatorów.' },
          { role: 'user', content: `Oto historia czatu:\n\n${conversationText}` }
        ]
      });
      summaryText = completion.choices[0]?.message?.content || summaryText;
    }

    // Zapisz podsumowanie
    await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        summary: summaryText,
        status: 'PROCESSED'
      }
    });

    // Zgodnie z prośbą "aby nie zapisywało tych pdfów/ksiazek":
    // Usuwamy wektory i tymczasowe dane, ale najpierw odpinamy węzły grafu, żeby ich nie usunąć kaskadowo
    await prisma.graphNode.updateMany({
      where: { sessionId },
      data: { chunkId: null }
    });
    await prisma.sessionChunk.deleteMany({ where: { sessionId } });

    return NextResponse.json({ success: true, summary: summaryText });
  } catch (error: any) {
    console.error('Error in POST /api/sessions/[id]/summary:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
