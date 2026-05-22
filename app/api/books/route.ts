import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { BookIngestionService } from '@/src/server/services/BookIngestionService';
import { BookRepository } from '@/src/server/repositories/BookRepository';
import { BookPageRepository } from '@/src/server/repositories/BookPageRepository';
import { BookChunkRepository } from '@/src/server/repositories/BookChunkRepository';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { MathpixOcrAdapter } from '@/src/server/adapters/MathpixOcrAdapter';
import { BookChunkingService } from '@/src/server/services/BookChunkingService';
import { EmbeddingService } from '@/src/server/services/EmbeddingService';
import { OpenAIEmbeddingAdapter } from '@/src/server/adapters/OpenAIEmbeddingAdapter';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '@/src/server/repositories/GraphEdgeRepository';
import { GraphBuilderService } from '@/src/server/services/GraphBuilderService';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { z } from 'zod';

const uploadSchema = z.object({
  title: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Untitled';

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, `${Date.now()}_${file.name}`);
    await writeFile(filePath, buffer);

    const bookRepo = new BookRepository(prisma);
    const pageRepo = new BookPageRepository(prisma);
    const ocrAdapter = new MathpixOcrAdapter(process.env.MATHPIX_API_KEY || '');
    const chunkRepo = new BookChunkRepository(prisma);
    const chunkingService = new BookChunkingService(chunkRepo);
    const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
    const embeddingRepo = new EmbeddingRepository(prisma);
    const embeddingService = new EmbeddingService(chunkRepo, embeddingRepo, embeddingAdapter);
    
    const nodeRepo = new GraphNodeRepository(prisma);
    const edgeRepo = new GraphEdgeRepository(prisma);
    const graphBuilderService = new GraphBuilderService(nodeRepo, edgeRepo, chunkRepo, embeddingRepo);

    const ingestionService = new BookIngestionService(bookRepo, pageRepo, ocrAdapter, chunkingService, embeddingService, graphBuilderService);

    const book = await ingestionService.createBook((session.user as any).id, title);
    
    // Przetwarzanie asynchroniczne w tle, bez oczekiwania
    ingestionService.processBook(book.id, filePath).catch(err => {
      console.error('Błąd asynchronicznego przetwarzania książki:', err);
    });

    return NextResponse.json({ bookId: book.id, status: book.status });
  } catch (error: any) {
    console.error('Error in POST /api/books:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error', stack: error.stack }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookRepo = new BookRepository(prisma);
  const books = await bookRepo.findByUserId((session.user as any).id);
  return NextResponse.json({ books });
}
