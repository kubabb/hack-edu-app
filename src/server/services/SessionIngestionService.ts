import { PrismaClient } from '@prisma/client';
import { LearningSessionRepository } from '../repositories/LearningSessionRepository';
import { OcrAdapter } from '../adapters/OcrAdapter';
import { SessionChunkingService } from './SessionChunkingService';
import { EmbeddingService } from './EmbeddingService';
import { GraphBuilderService } from './GraphBuilderService';
import { MindMapBuilderService } from './MindMapBuilderService';
import { SessionChunkRepository } from '../repositories/SessionChunkRepository';

export class SessionIngestionService {
  constructor(
    private prisma: PrismaClient,
    private sessionRepo: LearningSessionRepository,
    private ocrAdapter: OcrAdapter,
    private chunkingService: SessionChunkingService,
    private embeddingService: EmbeddingService,
    private graphBuilderService: GraphBuilderService,
    private chunkRepo: SessionChunkRepository
  ) {}

  async createSession(userId: string, topic: string) {
    return this.sessionRepo.create({ userId, topic });
  }

  async processSessionFile(sessionId: string, filePath: string) {
    await this.sessionRepo.updateStatus(sessionId, 'PROCESSING');
    try {
      const pages = await this.ocrAdapter.extractPages(filePath);
      const fullText = pages.map(p => p.text).join('\n\n');

      await this.chunkingService.chunkText(sessionId, fullText);
      await this.embeddingService.embedSessionChunks(sessionId);
      await this.graphBuilderService.buildGraph(sessionId);

      // Build mind map after graph is ready
      try {
        const mindMapService = new MindMapBuilderService(this.prisma, this.chunkRepo);
        await mindMapService.buildTree(sessionId);
      } catch (e) {
        console.error('Mind map building failed (non-critical):', e);
      }

      await this.sessionRepo.updateStatus(sessionId, 'PROCESSED');
    } catch (e) {
      await this.sessionRepo.updateStatus(sessionId, 'FAILED');
      throw e;
    }
  }
}
