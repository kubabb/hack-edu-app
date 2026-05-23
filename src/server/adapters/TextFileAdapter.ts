import { readFile } from 'fs/promises';
import { OcrAdapter } from './OcrAdapter';

/**
 * Adapter for text-based files (.md, .txt).
 * Reads the file directly — no parsing needed.
 */
export class TextFileAdapter implements OcrAdapter {
  async extractPages(filePath: string): Promise<{ pageNumber: number; text: string }[]> {
    const content = await readFile(filePath, 'utf-8');

    if (!content.trim()) {
      return [{ pageNumber: 1, text: '' }];
    }

    return [{ pageNumber: 1, text: content.trim() }];
  }
}
