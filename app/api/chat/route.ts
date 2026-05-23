import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { TutoringService } from '@/src/server/services/TutoringService';
import { LearningSessionRepository } from '@/src/server/repositories/LearningSessionRepository';
import { ChatMessageRepository } from '@/src/server/repositories/ChatMessageRepository';
import { KnowledgeQueryService } from '@/src/server/services/KnowledgeQueryService';
import { OpenAILlmAdapter } from '@/src/server/adapters/OpenAILlmAdapter';
import { OpenAIEmbeddingAdapter } from '@/src/server/adapters/OpenAIEmbeddingAdapter';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import { z } from 'zod';

const chatSchema = z.object({
  sessionId: z.string().nullable().optional(), // może być null (pierwszy render)
  bookId: z.string().nullable().optional(),    
  message: z.string().min(1),
  selectedNodeId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request: ' + parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });

    const { message, selectedNodeId } = parsed.data;
    // bookId and sessionId are the same — session ID from URL
    const activeSessionId = parsed.data.bookId || parsed.data.sessionId;
    if (!activeSessionId) {
      return NextResponse.json({ error: 'Brak ID sesji. Odśwież stronę i spróbuj ponownie.' }, { status: 400 });
    }

    const sessionRepo = new LearningSessionRepository(prisma);
    const messageRepo = new ChatMessageRepository(prisma);
    const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
    const embeddingRepo = new EmbeddingRepository(prisma);
    const nodeRepo = new GraphNodeRepository(prisma);
    const chunkRepo = new SessionChunkRepository(prisma);
    const knowledgeQueryService = new KnowledgeQueryService(embeddingAdapter, embeddingRepo, nodeRepo, chunkRepo);
    const llmAdapter = new OpenAILlmAdapter(process.env.OPENAI_API_KEY || '');
    const tutoringService = new TutoringService(sessionRepo, messageRepo, knowledgeQueryService, llmAdapter);

    const result = await tutoringService.handleUserMessage(activeSessionId, message, selectedNodeId || undefined);

    return NextResponse.json({
      sessionId: activeSessionId,
      assistantMessage: result.assistantMessage,
    });
  } catch (error: any) {
    console.error('Error in POST /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', stack: error.stack }, { status: 500 });
  }
}
