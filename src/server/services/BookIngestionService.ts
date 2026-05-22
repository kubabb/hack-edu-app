import { BookRepository } from '../repositories/BookRepository';
import { BookPageRepository } from '../repositories/BookPageRepository';
import { OcrAdapter } from '../adapters/OcrAdapter';
import { BookChunkingService } from './BookChunkingService';
import { EmbeddingService } from './EmbeddingService';

export class BookIngestionService {
  constructor(
    private bookRepo: BookRepository,
    private pageRepo: BookPageRepository,
    private ocrAdapter: OcrAdapter,
    private chunkingService: BookChunkingService,
    private embeddingService: EmbeddingService
  ) {}

  async createBook(userId: string, title: string) {
    return this.bookRepo.create({ userId, title });
  }

  async processBook(bookId: string, filePath: string) {
    await this.bookRepo.updateStatus(bookId, 'PROCESSING');
    try {
      const pages = await this.ocrAdapter.extractPages(filePath);
      const pageRecords = await this.pageRepo.createMany(
        pages.map((p, i) => ({ bookId, pageNumber: i + 1, rawText: p.text }))
      );
      await this.chunkingService.chunkPages(pageRecords);
      await this.embeddingService.embedBookChunks(bookId);
      await this.bookRepo.updateStatus(bookId, 'PROCESSED');
    } catch (e) {
      await this.bookRepo.updateStatus(bookId, 'FAILED');
      throw e;
    }
  }
}
