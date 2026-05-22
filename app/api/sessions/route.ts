import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { SessionIngestionService } from '@/src/server/services/SessionIngestionService';
import { LearningSessionRepository } from '@/src/server/repositories/LearningSessionRepository';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { MathpixOcrAdapter } from '@/src/server/adapters/MathpixOcrAdapter';
import { SessionChunkingService } from '@/src/server/services/SessionChunkingService';
import { EmbeddingService } from '@/src/server/services/EmbeddingService';
import { OpenAIEmbeddingAdapter } from '@/src/server/adapters/OpenAIEmbeddingAdapter';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '@/src/server/repositories/GraphEdgeRepository';
import { GraphBuilderService } from '@/src/server/services/GraphBuilderService';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const topic = (formData.get('title') as string) || 'Brak tematu'; // w formularzu "title", ale to teraz "topic"

    const sessionRepo = new LearningSessionRepository(prisma);

    if (!file) {
      const learningSession = await sessionRepo.create({ userId: (session.user as any).id, topic, status: 'PROCESSED' });
      return NextResponse.json({ sessionId: learningSession.id, status: learningSession.status });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, `${Date.now()}_${file.name}`);
    await writeFile(filePath, buffer);

    const ocrAdapter = new MathpixOcrAdapter(process.env.MATHPIX_API_KEY || '');
    const chunkRepo = new SessionChunkRepository(prisma);
    const chunkingService = new SessionChunkingService(chunkRepo);
    const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
    const embeddingRepo = new EmbeddingRepository(prisma);
    const embeddingService = new EmbeddingService(chunkRepo, embeddingRepo, embeddingAdapter);
    
    const nodeRepo = new GraphNodeRepository(prisma);
    const edgeRepo = new GraphEdgeRepository(prisma);
    const graphBuilderService = new GraphBuilderService(nodeRepo, edgeRepo, chunkRepo, embeddingRepo);

    const ingestionService = new SessionIngestionService(sessionRepo, ocrAdapter, chunkingService, embeddingService, graphBuilderService);

    const learningSession = await ingestionService.createSession((session.user as any).id, topic);
    
    // Przetwarzanie w tle
    ingestionService.processSessionFile(learningSession.id, filePath).catch(err => {
      console.error('Błąd asynchronicznego przetwarzania pliku sesji:', err);
    });

    return NextResponse.json({ sessionId: learningSession.id, status: learningSession.status });
  } catch (error: any) {
    console.error('Error in POST /api/sessions:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', stack: error.stack }, { status: 500 });
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
        select: { chunks: true, messages: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ sessions });
}
