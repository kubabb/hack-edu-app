import { SessionChunkRepository } from '../repositories/SessionChunkRepository';

export class SessionChunkingService {
  constructor(private chunkRepo: SessionChunkRepository) {}

  async chunkText(sessionId: string, rawText: string) {
    const chunks: { sessionId: string; type: any; content: string; position: number }[] = [];
    let position = 0;

    const lines = rawText.split('\n');
    let currentType = 'OTHER';
    let currentContent = '';

    const flush = () => {
      if (currentContent.trim()) {
        chunks.push({
          sessionId,
          type: currentType,
          content: currentContent.trim(),
          position: position++,
        });
      }
      currentContent = '';
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^Zadanie\s*\d+/i.test(trimmed)) {
        flush();
        currentType = 'TASK';
        currentContent = trimmed;
      } else if (/^Przykład\s*\d+/i.test(trimmed)) {
        flush();
        currentType = 'EXAMPLE';
        currentContent = trimmed;
      } else if (/^Teoria|Wprowadzenie/i.test(trimmed)) {
        flush();
        currentType = 'THEORY';
        currentContent = trimmed;
      } else {
        currentContent += '\n' + trimmed;
      }
    }
    flush();

    if (chunks.length > 0) {
      await this.chunkRepo.createMany(chunks);
    }
  }
}
