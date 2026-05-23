import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { FlashcardRepository } from '@/src/server/repositories/FlashcardRepository';
import { KnowledgeQueryService } from '@/src/server/services/KnowledgeQueryService';
import { OpenAIEmbeddingAdapter } from '@/src/server/adapters/OpenAIEmbeddingAdapter';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import { createOpenAIClient, resolveModel } from '@/src/server/lib/openai-client';
import { z } from 'zod';

const FlashcardsPostSchema = z.object({
  nodeId: z.string().optional(),
  query: z.string().optional(),
  save: z.boolean().optional().default(true),
});

// Extract JSON from LLM responses that may wrap it in markdown or have extra text
function extractFlashcardsJson(text: string): any[] {
  // Try direct parse first
  try {
    const parsed = JSON.parse(text);
    if (parsed.flashcards) return parsed.flashcards;
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {}

  // Try extracting from markdown code blocks
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlock) {
    try {
      const parsed = JSON.parse(jsonBlock[1]);
      if (parsed.flashcards) return parsed.flashcards;
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // Try finding JSON object with flashcards key
  const objMatch = text.match(/\{\s*"flashcards"\s*:\s*\[[\s\S]*?\]\s*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      if (parsed.flashcards) return parsed.flashcards;
    } catch {}
  }

  return [];
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Return saved flashcard sets with their cards
    const repo = new FlashcardRepository(prisma);
    const sets = await repo.findBySessionId(id);
    
    // Flatten: return first set's cards for backward compat, plus all sets
    const firstSetCards = sets.length > 0 ? sets[0].cards : [];
    
    return NextResponse.json({ flashcards: firstSetCards, sets });

  } catch (error: any) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch flashcards' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = FlashcardsPostSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input: ' + parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });

    const { nodeId, query, save } = parsed.data;

    // Get context based on source
    let contextText = '';
    let title = 'Fiszki';
    let sourceType = 'summary';
    let sourceId: string | undefined;

    if (nodeId) {
      const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
      const embeddingRepo = new EmbeddingRepository(prisma);
      const nodeRepo = new GraphNodeRepository(prisma);
      const chunkRepo = new SessionChunkRepository(prisma);
      const knowledgeService = new KnowledgeQueryService(embeddingAdapter, embeddingRepo, nodeRepo, chunkRepo);
      const chunks = await knowledgeService.getChunksForNode(id, nodeId);
      contextText = chunks.join('\n\n');
      title = 'Fiszki z węzła';
      sourceType = 'node';
      sourceId = nodeId;
    } else if (query) {
      const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
      const embeddingRepo = new EmbeddingRepository(prisma);
      const nodeRepo = new GraphNodeRepository(prisma);
      const chunkRepo = new SessionChunkRepository(prisma);
      const knowledgeService = new KnowledgeQueryService(embeddingAdapter, embeddingRepo, nodeRepo, chunkRepo);
      const chunks = await knowledgeService.getChunksByQuery(id, query, 10);
      contextText = chunks.join('\n\n');
      title = `Fiszki: ${query.substring(0, 50)}`;
      sourceType = 'query';
      sourceId = query;
    } else {
      // Try chunks first, then fallback to summary
      const chunkRepo = new SessionChunkRepository(prisma);
      const allChunks = await chunkRepo.findBySessionId(id);
      if (allChunks.length > 0) {
        contextText = allChunks.map(c => c.content).join('\n\n');
        title = 'Fiszki z materiału';
        sourceType = 'chunks';
      } else {
        const learningSession = await prisma.learningSession.findUnique({
          where: { id },
          select: { summary: true, topic: true },
        });
        if (!learningSession?.summary) {
          return NextResponse.json({ error: 'Brak materiału do stworzenia fiszek. Najpierw wgraj plik lub wygeneruj notatki.' }, { status: 400 });
        }
        contextText = learningSession.summary;
        title = `Fiszki: ${learningSession.topic || 'Sesja'}`;
      }
    }

    if (!contextText.trim()) {
      return NextResponse.json({ error: 'Brak tekstu do wygenerowania fiszek.' }, { status: 400 });
    }

    // Generate flashcards with LLM
    const openai = createOpenAIClient(process.env.OPENAI_API_KEY || '');

    const systemPrompt = `Jesteś ekspertem edukacyjnym. Tworzysz fiszki na podstawie materiału.
ZWRÓĆ WYNIK W FORMACIE JSON: {"flashcards": [{"question": "...", "answer": "..."}]}
Stwórz 5-8 fiszek. Każda fiszka ma pole "question" (pytanie) i "answer" (krótka, rzeczowa odpowiedź).
ODPOWIEDZ TYLKO JSON-em, bez żadnego dodatkowego tekstu.`;

    const completion = await openai.chat.completions.create({
      model: resolveModel('gpt-4o-mini', process.env.OPENAI_API_KEY || ''),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Stwórz fiszki z poniższego materiału:\n\n${contextText.substring(0, 12000)}` },
      ],
      temperature: 0.3,
      max_completion_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('LLM nie zwrócił odpowiedzi');
    }

    const cards = extractFlashcardsJson(content);

    if (cards.length === 0) {
      throw new Error(`Nie udało się sparsować fiszek z odpowiedzi LLM. Odpowiedź: ${content.substring(0, 200)}`);
    }

    // Save if requested
    let setId: string | undefined;
    if (save && cards.length > 0) {
      const repo = new FlashcardRepository(prisma);
      setId = await repo.createSet({
        sessionId: id,
        title,
        sourceType,
        sourceId,
        cards,
      });
    }

    return NextResponse.json({ flashcards: cards, setId, title });

  } catch (error: any) {
    console.error('Error generating flashcards:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to generate flashcards' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const setId = body.setId;
    if (!setId) return NextResponse.json({ error: 'setId required' }, { status: 400 });

    const repo = new FlashcardRepository(prisma);
    await repo.deleteSet(setId);
    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('Error deleting flashcard set:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete' }, { status: 500 });
  }
}
