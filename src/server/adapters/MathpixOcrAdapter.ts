import { OcrAdapter } from './OcrAdapter';

export class MathpixOcrAdapter implements OcrAdapter {
  constructor(private apiKey: string) {}

  async extractPages(filePath: string): Promise<{ pageNumber: number; text: string }[]> {
    // OCR pominięty - zwraca pustą tablicę zgodnie z poleceniem
    console.log('Skipping Mathpix OCR extraction for:', filePath);
    return [];
  }
}
