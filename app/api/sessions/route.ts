import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/src/server/prisma';
import { SessionIngestionService } from '@/src/server/services/SessionIngestionService';
import { LearningSessionRepository } from '@/src/server/repositories/LearningSessionRepository';
import { SessionChunkRepository } from '@/src/server/repositories/SessionChunkRepository';
import { EmbeddingRepository } from '@/src/server/repositories/EmbeddingRepository';
import { PdfParseAdapter } from '@/src/server/adapters/PdfParseAdapter';
import { TextFileAdapter } from '@/src/server/adapters/TextFileAdapter';
import { TesseractOcrAdapter } from '@/src/server/adapters/TesseractOcrAdapter';
import { SessionChunkingService } from '@/src/server/services/SessionChunkingService';
import { EmbeddingService } from '@/src/server/services/EmbeddingService';
import { OpenAIEmbeddingAdapter } from '@/src/server/adapters/OpenAIEmbeddingAdapter';
import { GraphNodeRepository } from '@/src/server/repositories/GraphNodeRepository';
import { GraphEdgeRepository } from '@/src/server/repositories/GraphEdgeRepository';
import { GraphBuilderService } from '@/src/server/services/GraphBuilderService';
import { KnowledgeQueryService } from '@/src/server/services/KnowledgeQueryService';
import { createOpenAIClient, resolveModel } from '@/src/server/lib/openai-client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { fetchYouTubeTranscript } from '@/src/server/lib/youtube';

export const runtime = 'nodejs';
export const maxDuration = 120;

const SUPPORTED_EXTENSIONS = new Set(['pdf', 'md', 'txt', 'png', 'jpg', 'jpeg']);

function getAuthenticatedUserId(session: Awaited<ReturnType<typeof auth>>) {
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    throw new Error('Brak identyfikatora użytkownika.');
  }
  return userId;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'unknown error';
}

function getErrorStack(error: unknown) {
  if (error instanceof Error) return error.stack;
  return undefined;
}

function getFileExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() || '';
}

function isSupportedUpload(file: File) {
  const extension = getFileExtension(file.name);
  return Boolean(extension) && SUPPORTED_EXTENSIONS.has(extension) && !file.name.startsWith('.');
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = getAuthenticatedUserId(session);

    const formData = await req.formData();
    const uploadedFiles = formData.getAll('file') as File[];
    const files = uploadedFiles
      .filter(isSupportedUpload)
      .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
    const topic = (formData.get('title') as string) || 'Brak tematu';
    const mode = (formData.get('mode') as string) || 'chat';
    const youtubeUrl = (formData.get('youtubeUrl') as string | null)?.trim() || '';

    const sessionRepo = new LearningSessionRepository(prisma);

    if (uploadedFiles.length > 0 && files.length === 0 && !youtubeUrl) {
      return NextResponse.json({
        error: 'Wybrany folder nie zawiera obsługiwanych plików. Dodaj PDF, MD albo TXT.',
      }, { status: 400 });
    }

    if (files.length === 0 && !youtubeUrl) {
      const learningSession = await sessionRepo.create({ userId, topic, status: 'PROCESSED' });
      return NextResponse.json({ sessionId: learningSession.id, status: learningSession.status, mode });
    }

    // Prepare adapters
    const pdfAdapter = new PdfParseAdapter();
    const textAdapter = new TextFileAdapter();
    const tesseractAdapter = new TesseractOcrAdapter();
    const chunkRepo = new SessionChunkRepository(prisma);
    const chunkingService = new SessionChunkingService(chunkRepo);
    const embeddingAdapter = new OpenAIEmbeddingAdapter(process.env.OPENAI_API_KEY || '');
    const embeddingRepo = new EmbeddingRepository(prisma);
    const embeddingService = new EmbeddingService(chunkRepo, embeddingRepo, embeddingAdapter);
    const nodeRepo = new GraphNodeRepository(prisma);
    const edgeRepo = new GraphEdgeRepository(prisma);
    const graphBuilderService = new GraphBuilderService(nodeRepo, edgeRepo, chunkRepo, embeddingRepo);

    // Determine adapter by extension (module-level helper)
    const getAdapter = (filename: string) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      if (ext === 'md' || ext === 'txt') return textAdapter;
      if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return tesseractAdapter;
      return pdfAdapter;
    };

    // Extract text from ALL files, combine
    const uploadDir = join(process.cwd(), 'tmp', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    let allText = '';
    const diskBackedFilePaths: string[] = [];

    if (youtubeUrl) {
      const transcriptData = await fetchYouTubeTranscript(youtubeUrl);
      const transcriptHeader = [
        `# ${transcriptData.title}`,
        '',
        `Źródło: ${youtubeUrl}`,
        transcriptData.languageLabel
          ? `Język transkrypcji: ${transcriptData.languageLabel}`
          : undefined,
        '',
        '## Transkrypcja',
        transcriptData.transcript,
      ]
        .filter(Boolean)
        .join('\n');

      allText += transcriptHeader.trim();
    }
    
    for (const file of files) {
      try {
        const ext = getFileExtension(file.name);
        if (ext === 'md' || ext === 'txt') {
          const fileText = (await file.text()).trim();
          if (fileText) {
            allText += (allText ? '\n\n---\n\n' : '') + fileText;
          }
          continue;
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const safeName = file.name.replace(/[<>:"/\\|?*]/g, '_');
        const filePath = join(uploadDir, `${Date.now()}_${safeName}`);
        await writeFile(filePath, buffer);
        diskBackedFilePaths.push(filePath);

        const adapter = getAdapter(file.name);
        const pages = await adapter.extractPages(filePath);
        const fileText = pages.map(p => p.text).join('\n\n');
        if (fileText.trim()) {
          allText += (allText ? '\n\n---\n\n' : '') + fileText.trim();
        }
      } catch (e: unknown) {
        console.error(`Error extracting text from ${file.name}:`, getErrorMessage(e));
      }
    }

    if (!allText.trim()) {
      if (diskBackedFilePaths.length === 0) {
        return NextResponse.json({
          error: 'Nie udało się odczytać treści z wybranego folderu. Dodaj pliki PDF, MD lub TXT z tekstem.',
        }, { status: 400 });
      }

      // Fallback: try processing first file directly through the pipeline
      const firstSupportedDiskFile = files.find((file) => getFileExtension(file.name) === 'pdf');
      const ocrAdapter = getAdapter(firstSupportedDiskFile?.name || files[0].name);
      const ingestionService = new SessionIngestionService(
        prisma, sessionRepo, ocrAdapter,
        chunkingService, embeddingService, graphBuilderService, chunkRepo,
      );
      const learningSession = await ingestionService.createSession(userId, topic);
      
      try {
        const fallbackPath = youtubeUrl
          ? await writeCombinedFallback(uploadDir, allText)
          : diskBackedFilePaths[0];

        await ingestionService.processSessionFile(learningSession.id, fallbackPath);
      } catch (err: unknown) {
        return NextResponse.json({
          sessionId: learningSession.id,
          status: 'FAILED',
          mode,
          error: `Nie udało się przetworzyć pliku: ${getErrorMessage(err)}`,
        }, { status: 500 });
      }
      
      const finalNotes = await handleNotesGeneration(learningSession.id, mode, chunkRepo, embeddingAdapter, embeddingRepo, nodeRepo);
      return NextResponse.json({
        sessionId: learningSession.id,
        status: 'PROCESSED',
        mode,
        notes: finalNotes,
        fileCount: 1,
      });
    }

    // Create session and process combined text
    const ingestionService = new SessionIngestionService(
      prisma, sessionRepo, textAdapter,
      chunkingService, embeddingService, graphBuilderService, chunkRepo,
    );

    const learningSession = await ingestionService.createSession(userId, topic);

    // Write combined text to a temp .md file and process it
    const combinedPath = join(uploadDir, `${Date.now()}_combined.md`);
    await writeFile(combinedPath, allText);

    try {
      await ingestionService.processSessionFile(learningSession.id, combinedPath);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      console.error('Błąd przetwarzania pliku sesji:', msg, getErrorStack(err)?.slice(0, 500));
      return NextResponse.json({
        sessionId: learningSession.id,
        status: 'FAILED',
        mode,
        error: `Nie udało się przetworzyć pliku: ${msg}`,
      }, { status: 500 });
    }

    // Generate notes for notes mode
    const notes = await handleNotesGeneration(learningSession.id, mode, chunkRepo, embeddingAdapter, embeddingRepo, nodeRepo);

    return NextResponse.json({
      sessionId: learningSession.id,
      status: 'PROCESSED',
      mode,
      notes,
      fileCount: files.length,
    });

  } catch (error: unknown) {
    console.error('Error in POST /api/sessions:', error);
    return NextResponse.json({ error: getErrorMessage(error) || 'Internal Server Error' }, { status: 500 });
  }
}

async function writeCombinedFallback(uploadDir: string, allText: string) {
  const fallbackPath = join(uploadDir, `${Date.now()}_youtube_combined.md`);
  await writeFile(fallbackPath, allText);
  return fallbackPath;
}

async function handleNotesGeneration(
  sessionId: string,
  mode: string,
  chunkRepo: SessionChunkRepository,
  embeddingAdapter: OpenAIEmbeddingAdapter,
  embeddingRepo: EmbeddingRepository,
  nodeRepo: GraphNodeRepository,
): Promise<string | null> {
  if (mode !== 'notes') return null;

  try {
    const allChunks = await chunkRepo.findBySessionId(sessionId);
    if (allChunks.length === 0) return null;

    const fullText = allChunks.map(c => c.content).join('\n\n');
    const knowledgeService = new KnowledgeQueryService(embeddingAdapter, embeddingRepo, nodeRepo, chunkRepo);

    const keyConcepts = await knowledgeService.getChunksByQuery(
      sessionId, 'najważniejsze pojęcia definicje twierdzenia podsumowanie główne tematy', 15);
    const structureChunks = await knowledgeService.getChunksByQuery(
      sessionId, 'rozdział sekcja wprowadzenie wstęp nagłówek struktura', 10);
    const relevantChunks = Array.from(new Set([...keyConcepts, ...structureChunks]));

    const contextBlock = relevantChunks.length > 0
      ? `MATERIAŁ ŹRÓDŁOWY:\n\n${relevantChunks.map((c, i) => `[Fragment ${i + 1}]\n${c}`).join('\n\n---\n\n')}`
      : `PEŁEN MATERIAŁ:\n\n${fullText.substring(0, 12000)}`;

    const systemPrompt = `Jesteś ekspertem edukacyjnym. Stwórz RZECZOWE notatki w formacie Markdown.\n\nZASADY:\n1. Tytuł (H1)\n2. GŁÓWNE TEMATY (H2)\n3. Definicje, pojęcia, wzory\n4. Przykłady\n5. Sekcja "Najważniejsze do zapamiętania"\n6. Pisz po polsku\n7. TYLKO z dostarczonego materiału`;

    const openai = createOpenAIClient(process.env.OPENAI_API_KEY || '');
    const completion = await openai.chat.completions.create({
      model: resolveModel('gpt-4o-mini', process.env.OPENAI_API_KEY || ''),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Stwórz notatki:\n\n${contextBlock}` },
      ],
      temperature: 0.3,
      max_completion_tokens: 4000,
    });

    const notes = completion.choices[0]?.message?.content;
    if (notes) {
      await prisma.learningSession.update({ where: { id: sessionId }, data: { summary: notes } });
    }
    return notes || null;
  } catch (e) {
    console.error('Auto-generacja notatek nie powiodła się:', e);
    return null;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = getAuthenticatedUserId(session);

  const sessions = await prisma.learningSession.findMany({
    where: { userId },
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
