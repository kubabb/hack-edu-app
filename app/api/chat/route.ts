import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { TutoringService } from '@/src/server/services/TutoringService';
import { ChatSessionRepository } from '@/src/server/repositories/ChatSessionRepository';
import { ChatMessageRepository } from '@/src/server/repositories/ChatMessageRepository';
import { KnowledgeQueryService } from '@/src/server/services/KnowledgeQueryService';
import { OpenAILlmAdapter } from '@/src/server/adapters/OpenAILlmAdapter';
import { OpenAIEmbeddingAdapter } from '@/src/server/adapters/OpenAIEmbeddingAdapter';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { BookChunkRepository } from '@/src/server/repositories/BookChunkRepository';
import { z } from 'zod';

const chatSchema = z.object({
  sessionId: z.string().optional(),
  bookId: z.string(),
  message: z.string().min(1),
  selectedNodeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { sessionId, bookId, message, selectedNodeId } = parsed.data;
  const userId = (session.user as any).id;

  const sessionRepo = new ChatSessionRepository(prisma);
  const messageRepo = new ChatMessageRepository(prisma);
  const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
  const embeddingRepo = new EmbeddingRepository(prisma);
  const nodeRepo = new GraphNodeRepository(prisma);
  const chunkRepo = new BookChunkRepository(prisma);
  const knowledgeQueryService = new KnowledgeQueryService(embeddingAdapter, embeddingRepo, nodeRepo, chunkRepo);
  const llmAdapter = new OpenAILlmAdapter(process.env.OPENAI_API_KEY || '');
  const tutoringService = new TutoringService(sessionRepo, messageRepo, knowledgeQueryService, llmAdapter);

  let activeSessionId = sessionId;
  if (!activeSessionId) {
    const newSession = await tutoringService.startSession(userId, bookId);
    activeSessionId = newSession.id;
  }

  const result = await tutoringService.handleUserMessage(activeSessionId, message, selectedNodeId);

  return NextResponse.json({
    sessionId: activeSessionId,
    assistantMessage: result.assistantMessage,
  });
}
