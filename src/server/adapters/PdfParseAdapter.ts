import { OcrAdapter } from './OcrAdapter';

// pdfreader is pure Node.js — no DOM dependencies
const { PdfReader } = require('pdfreader');

export class PdfParseAdapter implements OcrAdapter {
  async extractPages(filePath: string): Promise<{ pageNumber: number; text: string }[]> {
    return new Promise((resolve, reject) => {
      const reader = new PdfReader();
      const pages: Record<number, string[]> = {};

      reader.parseFileItems(filePath, (err: any, item: any) => {
        if (err) {
          reject(new Error(err?.message || 'PDF parsing error'));
          return;
        }

        if (!item) {
          // EOF — build result
          const results = Object.entries(pages)
            .map(([page, lines]) => ({
              pageNumber: parseInt(page),
              text: lines.join('\n'),
            }))
            .filter((p: { text: string }) => p.text.trim())
            .sort((a, b) => a.pageNumber - b.pageNumber);

          resolve(results.length > 0 ? results : [{ pageNumber: 1, text: '' }]);
          return;
        }

        if (item.text && item.text.trim()) {
          const page = item.page || 1;
          if (!pages[page]) pages[page] = [];
          pages[page].push(item.text.trim());
        }
      });
    });
  }
}
