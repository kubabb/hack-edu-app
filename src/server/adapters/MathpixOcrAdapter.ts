import { OcrAdapter } from './OcrAdapter';

export class MathpixOcrAdapter implements OcrAdapter {
  constructor(private apiKey: string) {}

  async extractPages(filePath: string): Promise<{ pageNumber: number; text: string }[]> {
    // TODO: implement Mathpix OCR API call
    throw new Error('TODO: Implement Mathpix OCR call. File: ' + filePath);
  }
}
