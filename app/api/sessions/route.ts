import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { SessionIngestionService } from '@/src/server/services/SessionIngestionService';
import { LearningSessionRepository } from '@/src/server/repositories/LearningSessionRepository';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { PdfParseAdapter } from '@/src/server/adapters/PdfParseAdapter';
import { SessionChunkingService } from '@/src/server/services/SessionChunkingService';
import { EmbeddingService } from '@/src/server/services/EmbeddingService';
import { OpenAIEmbeddingAdapter } from '@/src/server/adapters/OpenAIEmbeddingAdapter';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '@/src/server/repositories/GraphEdgeRepository';
import { GraphBuilderService } from '@/src/server/services/GraphBuilderService';
import { KnowledgeQueryService } from '@/src/server/services/KnowledgeQueryService';
import { createOpenAIClient } from '@/src/server/lib/openai-client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const topic = (formData.get('title') as string) || 'Brak tematu';
    const mode = (formData.get('mode') as string) || 'chat'; // 'chat' | 'notes'

    const sessionRepo = new LearningSessionRepository(prisma);

    if (!file) {
      const learningSession = await sessionRepo.create({ userId: (session.user as any).id, topic, status: 'PROCESSED' });
      return NextResponse.json({ sessionId: learningSession.id, status: learningSession.status, mode });
    }

    // Zapisz plik tymczasowo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, `${Date.now()}_${file.name}`);
    await writeFile(filePath, buffer);

    const ocrAdapter = new PdfParseAdapter();
    const chunkRepo = new SessionChunkRepository(prisma);
    const chunkingService = new SessionChunkingService(chunkRepo);
    const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
    const embeddingRepo = new EmbeddingRepository(prisma);
    const embeddingService = new EmbeddingService(chunkRepo, embeddingRepo, embeddingAdapter);

    const nodeRepo = new GraphNodeRepository(prisma);
    const edgeRepo = new GraphEdgeRepository(prisma);
    const graphBuilderService = new GraphBuilderService(nodeRepo, edgeRepo, chunkRepo, embeddingRepo);

    const ingestionService = new SessionIngestionService(
      prisma, sessionRepo, ocrAdapter,
      chunkingService, embeddingService, graphBuilderService, chunkRepo,
    );

    const learningSession = await ingestionService.createSession((session.user as any).id, topic);

    // Przetwarzanie SYNCHRONICZNE — czekamy aż chunki, embeddingi, graf i mapa myśli będą gotowe
    try {
      await ingestionService.processSessionFile(learningSession.id, filePath);
    } catch (err: any) {
      const msg = err?.message || err?.toString() || 'unknown error';
      console.error('Błąd przetwarzania pliku sesji:', msg, err?.stack?.slice(0, 500));
      return NextResponse.json({
        sessionId: learningSession.id,
        status: 'FAILED',
        mode,
        error: `Nie udało się przetworzyć pliku: ${msg}`,
      }, { status: 500 });
    }

    // Dla trybu "notes": auto-generuj notatki po przetworzeniu
    let notes: string | null = null;
    if (mode === 'notes') {
      try {
        const allChunks = await chunkRepo.findBySessionId(learningSession.id);
        if (allChunks.length > 0) {
          const fullText = allChunks.map(c => c.content).join('\n\n');

          const knowledgeService = new KnowledgeQueryService(
            embeddingAdapter, embeddingRepo, nodeRepo, chunkRepo,
          );

          // Znajdź najważniejsze fragmenty wektorowo
          const keyConcepts = await knowledgeService.getChunksByQuery(
            learningSession.id,
            'najważniejsze pojęcia definicje twierdzenia podsumowanie główne tematy',
            15,
          );

          const structureChunks = await knowledgeService.getChunksByQuery(
            learningSession.id,
            'rozdział sekcja wprowadzenie wstęp nagłówek struktura',
            10,
          );

          const relevantChunks = Array.from(new Set([...keyConcepts, ...structureChunks]));

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

          const openai = createOpenAIClient(process.env.OPENAI_API_KEY || '');
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Stwórz uporządkowane notatki z poniższego materiału:\n\n${contextBlock}` },
            ],
            temperature: 0.3,
            max_completion_tokens: 4000,
          });

          notes = completion.choices[0]?.message?.content || null;

          if (notes) {
            await prisma.learningSession.update({
              where: { id: learningSession.id },
              data: { summary: notes },
            });
          }
        }
      } catch (noteErr) {
        console.error('Auto-generacja notatek nie powiodła się (niekrytyczne):', noteErr);
        // Notatki można wygenerować później ręcznie
      }
    }

    return NextResponse.json({
      sessionId: learningSession.id,
      status: 'PROCESSED',
      mode,
      notes,                  // null jeśli mode='chat' lub generacja się nie udała
    });

  } catch (error: any) {
    console.error('Error in POST /api/sessions:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessions = await prisma.learningSession.findMany({
    where: { userId: (session.user as any).id },
    select: {
      id: true,
      topic: true,
      status: true,
      summary: true,
      createdAt: true,
      _count: {
        select: { chunks: true, messages: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ sessions });
}
