import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { KnowledgeQueryService } from '@/src/server/services/KnowledgeQueryService';
import { OpenAIEmbeddingAdapter } from '@/src/server/adapters/OpenAIEmbeddingAdapter';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import OpenAI from 'openai';
import { createOpenAIClient } from '@/src/server/lib/openai-client';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Sprawdź czy sesja istnieje i ma chunki
    const learningSession = await prisma.learningSession.findUnique({
      where: { id },
      include: {
        chunks: { select: { id: true }, take: 1 },
      },
    });

    if (!learningSession) {
      return NextResponse.json({ error: 'Sesja nie znaleziona' }, { status: 404 });
    }

    if (learningSession.chunks.length === 0) {
      return NextResponse.json({ error: 'Brak materiału do stworzenia notatek. Najpierw dodaj plik PDF.' }, { status: 400 });
    }

    // Pobierz wszystkie chunki
    const chunkRepo = new SessionChunkRepository(prisma);
    const allChunks = await chunkRepo.findBySessionId(id);

    if (allChunks.length === 0) {
      return NextResponse.json({ error: 'Brak chunków' }, { status: 400 });
    }

    const fullText = allChunks.map(c => c.content).join('\n\n');

    // Użyj wektorów do znalezienia najważniejszych fragmentów
    const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
    const embeddingRepo = new EmbeddingRepository(prisma);
    const nodeRepo = new GraphNodeRepository(prisma);
    const knowledgeService = new KnowledgeQueryService(embeddingAdapter, embeddingRepo, nodeRepo, chunkRepo);

    // Zapytaj wektorowo o najważniejsze koncepcje
    const keyConcepts = await knowledgeService.getChunksByQuery(
      id,
      'najważniejsze pojęcia definicje twierdzenia podsumowanie główne tematy',
      15
    );

    // Zapytaj o strukturę
    const structureChunks = await knowledgeService.getChunksByQuery(
      id,
      'rozdział sekcja wprowadzenie wstęp nagłówek struktura',
      10
    );

    // Połącz i deduplikuj
    const relevantChunks = Array.from(new Set([...keyConcepts, ...structureChunks]));

    // Generuj notatki przez LLM
    const openai = createOpenAIClient(process.env.OPENAI_API_KEY || '');

    const contextBlock = relevantChunks.length > 0
      ? `MATERIAŁ ŹRÓDŁOWY (najważniejsze fragmenty):\n\n${relevantChunks.map((c, i) => `[Fragment ${i + 1}]\n${c}`).join('\n\n---\n\n')}`
      : `PEŁEN MATERIAŁ:\n\n${fullText.substring(0, 12000)}`;

    const systemPrompt = `Jesteś ekspertem edukacyjnym i twórcą notatek. Otrzymujesz materiał edukacyjny.
Twoim zadaniem jest stworzyć RZECZOWE, STRUKTURALNE notatki w formacie Markdown.

ZASADY:
1. Zacznij od tytułu (H1) - wywnioskuj go z treści
2. Wypisz GŁÓWNE TEMATY w formie nagłówków (H2)
3. Pod każdym tematem wypisz KLUCZOWE POJĘCIA i DEFINICJE (lista wypunktowana)
4. Jeśli są wzory matematyczne - zapisz je w LaTeX (\`$...$\` dla inline, \`$$...$$\` dla bloków)
5. Jeśli są przykłady/zadania - wypisz je w osobnej sekcji "Przykłady i zadania"
6. Na końcu dodaj sekcję "Najważniejsze do zapamiętania" (3-5 punktów)
7. Formatuj czytelnie: używaj **pogrubień** dla kluczowych terminów, list, odstępów
8. Pisz po polsku
9. NIE pisz że "notatki zostały wygenerowane" - po prostu podaj treść
10. Bazuj TYLKO na dostarczonym materiale, nie wymyślaj`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Stwórz uporządkowane notatki z poniższego materiału:\n\n${contextBlock}` },
      ],
      temperature: 0.3,
      max_completion_tokens: 4000,
    });

    const notes = completion.choices[0]?.message?.content;

    if (!notes) {
      throw new Error('Nie udało się wygenerować notatek');
    }

    // Zapisz notatki do sesji
    await prisma.learningSession.update({
      where: { id },
      data: {
        summary: notes,  // Używamy pola summary do przechowywania notatek
        status: 'PROCESSED',
      },
    });

    return NextResponse.json({
      notes,
      fragmentCount: relevantChunks.length,
      totalChunks: allChunks.length,
    });

  } catch (error: any) {
    console.error('Error generating notes:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const learningSession = await prisma.learningSession.findUnique({
      where: { id },
      select: {
        id: true,
        topic: true,
        summary: true,
        status: true,
        _count: { select: { chunks: true } },
      },
    });

    if (!learningSession) {
      return NextResponse.json({ error: 'Sesja nie znaleziona' }, { status: 404 });
    }

    return NextResponse.json({
      id: learningSession.id,
      topic: learningSession.topic,
      notes: learningSession.summary,
      status: learningSession.status,
      chunkCount: learningSession._count.chunks,
    });

  } catch (error: any) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}
